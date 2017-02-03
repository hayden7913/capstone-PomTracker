exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://hayden321:46869269a@ds141118.mlab.com:41118/node-capstone';
exports.PORT = process.env.PORT || 8080;
