import logging

import azure.functions as func
import gpt_2_simple as gpt2
import os
import json

model_name = "774M"
if not os.path.isdir(os.path.join("models", model_name)):
	gpt2.download_gpt2(model_name=model_name)

sess = gpt2.start_tf_sess()
gpt2.load_gpt2(sess, model_name=model_name)


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('GPT2Api processed a request.')

    try:
        req_body = req.get_json()
        prefix = req_body.get('prefix')
        length = int(req_body.get('length'))
        nsamples = int(req_body.get('nsamples'))
    except:
        pass

    if name and prefix and nsamples:
        generated = gpt2.generate(
            sess, 
            model_name=model_name, 
            top_k=40, 
            top_p=0.9, 
            temperature=0.7, 
            return_as_list=True, 
            prefix=prefix, 
            length=length, 
            nsamples=nsamples
        )
        return func.HttpResponse(json.dumps(generated))
    else:
        return func.HttpResponse(
             "Please pass a request body",
             status_code=400
        )
