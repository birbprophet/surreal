from starlette.applications import Starlette
from starlette.responses import UJSONResponse
import gpt_2_simple as gpt2
import tensorflow as tf
import uvicorn
import os
import gc

app = Starlette(debug=False)

model_name = "774M"
if not os.path.isdir(os.path.join("models", model_name)):
    print(f"Downloading {model_name} model...")
    gpt2.download_gpt2(model_name=model_name)

sess = gpt2.start_tf_sess(threads=1)
gpt2.load_gpt2(sess, model_name=model_name)

# Needed to avoid cross-domain issues
response_header = {
    'Access-Control-Allow-Origin': '*'
}

generate_count = 0


@app.route('/', methods=['POST'])
async def homepage(request):
    global generate_count
    global sess

    params = await request.json()

    texts = gpt2.generate(sess,
                          length=int(params.get('length', 1023)),
                          temperature=float(params.get('temperature', 0.7)),
                          top_k=int(params.get('top_k', 0)),
                          top_p=float(params.get('top_p', 0)),
                          nsamples=float(params.get('nsamples', 1)),
                          prefix=params.get('prefix', '')[:500],
                          truncate=params.get('truncate', None),
                          include_prefix=str(params.get(
                              'include_prefix', True)).lower() == 'true',
                          return_as_list=True
                          )

    generate_count += 1
    if generate_count == 8:
        # Reload model to prevent Graph/Session from going OOM
        tf.reset_default_graph()
        sess.close()
        sess = gpt2.start_tf_sess(threads=1)
        gpt2.load_gpt2(sess)
        generate_count = 0

    gc.collect()
    return UJSONResponse(texts,
                         headers=response_header)

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
