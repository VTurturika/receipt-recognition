import cherrypy
from ocr import OcrHandler
from cherrypy.process.plugins import Daemonizer

@cherrypy.expose
class Root(object):

    @cherrypy.tools.json_out()
    def GET(self):
        return {'msg': 'it\'s working'}


@cherrypy.expose
class Ocr(object):


    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def POST(self):

        handler = OcrHandler()
        request = cherrypy.request.json

        if request['needOcr']:
            lines = handler.make_ocr(request['file'])
            items = handler.parse(lines)
        else:
            items = request['items']

        return handler.prepare_response(items)


@cherrypy.expose
class Feedback(object):

    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def POST(self):

        response = cherrypy.request.json
        return response

if __name__ == '__main__':
    conf = {
        '/': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
        }
    }

    root = Root()
    root.ocr = Ocr()
    root.feedback = Feedback()
    d = Daemonizer(cherrypy.engine)
    d.subscribe()
    cherrypy.quickstart(root, '/', conf)