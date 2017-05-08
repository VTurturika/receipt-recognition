import cherrypy
from ocr import OcrHandler

@cherrypy.expose
class Root(object):

    @cherrypy.tools.json_out()
    def GET(self):

        return {'msg': 'it\'s working'}


@cherrypy.expose
class Ocr(object):

    def __init__(self, handler):
        self.handler = handler

    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def POST(self):

        request_body = cherrypy.request.json
        request_body['msg'] = 'from cherrypy.ocr'
        request_body['ocr'] = self.handler.make_ocr(request_body['file'])

        print(request_body)

        return request_body


@cherrypy.expose
class Feedback(object):

    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def POST(self):

        response = cherrypy.request.json
        response['msg'] = 'from cherrypy.feedback'

        return response

if __name__ == '__main__':
    conf = {
        '/': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
        }
    }


    root = Root()
    root.ocr = Ocr( OcrHandler() )
    root.feedback = Feedback()

    cherrypy.quickstart(root, '/', conf)