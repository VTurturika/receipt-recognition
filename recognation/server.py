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

        response = cherrypy.request.json
        lines = self.handler.make_ocr(response['file'])
        response['parsed_products'] = self.handler.parse(lines)

        return response


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