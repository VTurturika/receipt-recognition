
import cherrypy


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
        return cherrypy.request.json


@cherrypy.expose
class Feedback(object):

    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def POST(self):
        return cherrypy.request.json

if __name__ == '__main__':
    conf = {
        '/': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
        }
    }
    root = Root()
    root.ocr = Ocr()
    root.feedback = Feedback()

    cherrypy.quickstart(root, '/', conf)