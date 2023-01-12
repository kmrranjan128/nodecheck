var express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    app = express(),
    path = require('path'),
    request = require('request'),
    _ = require('lodash'),
    fs = require('fs'),
    xml2js = require('xml2js');
   // config = require('./config');

// logging
// app.use(morgan('short'));

app.use(bodyParser());

var apiPath = "/alfext/ext";
var api = express.Router();

app.use(apiPath, api);

app.get('/one/two', function (req, res) {
    var url = req.url;
}
api.route("http://alfcms-app-stg-01:8080/alfresco/service/dcl/login/userinfo").get(function (req, res) {
  console.log
});

api.route("/whatsnew").get(function (req, res) {
  fs.createReadStream('./data/recent.json').pipe(res.type('json'));
});

api.route("/search/basic").get(function (req, res) {
  fs.createReadStream('./data/search.json').pipe(res.type('json'));
});

api.route('/main').get(function (req, res) {
  fs.createReadStream('./data/main.json').pipe(res.type('json'));
});

api.route("/favorites").get(function (req, res) {
  fs.createReadStream('./data/favorites.json').pipe(res.type('json'));
});

api.route("/addFavorite").post(function (req, res) {
  res.send({
    status: '200',
    message: 'Your document has been added as a favorite successfully'
  });
});
api.route("/removeFavorite").post(function (req, res) {
  res.send({
    status: '200',
    message: 'Your document has been removed as a favorite successfully'
  });
});

api.route("/folder/move").post(function (req, res) {
  res.send({
    "overallSuccess": "false",
    "statusCode": "417",
    "toNodeId": "workspace:\/\/SpacesStore\/cd4307f1-fdf0-4ae6-b428-b9b3a054294d",
    "inheritFolderPermission": "true",
    "moveComments": "gsdfg",
    "success": [],
    "results": [{
      "fileExist": "true"
    }],
    "failure": [{
      "name": "Hydrangeas.jpg",
      "nodeId": "workspace:\/\/SpacesStore\/62e361f0-fc74-4631-853e-66ffaf51d1d7",
      "message": "You can not move any secured \"Cisco Restricted\" documents to non secured folder as target folder is not enabled with IRM "
    }]
  });
});

api.route('/library').get(function (req, res) {
  fs.createReadStream('./data/tree.json').pipe(res.type('json'));
});

api.route("/folderlist").get(function (req, res) {
  fs.createReadStream('./data/library.json').pipe(res.type('json'));
});

api.route("/folder/view").get(function (req, res) {
  fs.createReadStream('./data/folderProperties.json').pipe(res.type('json'));
});

api.route("/folder/*").post(function (req, res) {
  res.send({
    status: 'ok',
    message: 'Your folder was created successfully',
    isRestrictContentExist: false
  });
});

api.route("/preview/*").get(function (req, res) {
  function readRangeHeader(range, totalLength) {
    if (!range) return null;

    var array = range.split(/bytes=([0-9]*)-([0-9]*)/),
      start = parseInt(array[1]),
      end = parseInt(array[2]),
      result = {
        Start: isNaN(start) ? 0 : start,
        End: isNaN(end) ? (totalLength - 1) : end
      };

    if (!isNaN(start) && isNaN(end)) {
      result.Start = start;
      result.End = totalLength - 1;
    }

    if (isNaN(start) && !isNaN(end)) {
      result.Start = totalLength - end;
      result.End = totalLength - 1;
    }

    return result;
  }

  function sendResponse(response, responseStatus, responseHeaders, readable) {
    response.writeHead(responseStatus, responseHeaders);
    if (!readable) {
      res.end();
    } else {
      readable.on('open', function () { readable.pipe(res); });
    }
    return null;
  }

  var filename = './data/test.mp4',
      responseHeaders = {},
      stat = fs.statSync(filename),
      rangeRequest = readRangeHeader(req.headers['range'], stat.size),
      mimeType = 'video/mp4', start, end;

  if (!rangeRequest) {
    responseHeaders['Content-Type'] = mimeType;
    responseHeaders['Content-Length'] = stat.size;  // File size.
    responseHeaders['Accept-Ranges'] = 'bytes';
    sendResponse(res, 200, responseHeaders, fs.createReadStream(filename));
    return;
  }

  start = rangeRequest.Start;
  end = rangeRequest.End;

  if (start >= stat.size || end >= stat.size) {
    // the range can't be fulfilled.
    responseHeaders['Content-Range'] = 'bytes */' + stat.size; // File size.
    sendResponse(res, 416, responseHeaders, null);
    return;
  }

  responseHeaders['Content-Range'] = 'bytes ' + start + '-' + end + '/' + stat.size;
  responseHeaders['Content-Length'] = start === end ? 0 : (end - start + 1);
  responseHeaders['Content-Type'] = mimeType;
  responseHeaders['Accept-Ranges'] = 'bytes';
  responseHeaders['Cache-Control'] = 'no-cache';

  sendResponse(res, 206, responseHeaders, fs.createReadStream(filename, { start: start, end: end }));
});

// api.route("/preview/*").get(function (req, res) {
//   fs.createReadStream('./data/test.pdf').pipe(res.type('pdf'));
// });

// api.route("/preview/*").get(function (req, res) {
//   fs.createReadStream('./data/test.mp4').pipe(res.type('mp4'));
// });

api.route("/delete/doc").post(function (req, res) {
  // TODO: remove or refactor this
  var API_PATH = config.API_PATH,
      TOKEN_PATH = config.TOKEN_PATH,
      EXPIRY_TIME = config.TOKEN_EXPIRY_TIME,
      now = new Date;

  var newurl = API_PATH + req.url + (_.isEmpty(req.query) ? "?" : "&") + "alf_ticket=" + token;
  console.log("POSTING TO:", newurl);
  console.log("POSTING WITH:", req.body);
  request.post(newurl, req.body).pipe(res);
});


// api.route("/permission/search").post(function (req, res) {
//   var API_PATH = config.API_PATH,
//       now = new Date;

//   var newurl = API_PATH + req.url + (_.isEmpty(req.query) ? "?" : "&") + "alf_ticket=" + token;
//   console.log("POSTING TO:", newurl);
//   console.log("POSTING WITH:", req.body);
//   request.post(newurl, req.body).pipe(res);
// });

api.route("/notifications").get(function (req, res) {
  fs.createReadStream('./data/notifications.json').pipe(res.type('json'));
});

api.route("/fileaccesshistory").get(function (req, res) {
 fs.createReadStream('./data/file-access-history.json').pipe(res.type('json'));
});

api.route("/workflow/reports").get(function (req, res) {
 fs.createReadStream('./data/workflowdetails.json').pipe(res.type('json'));
});

api.route("/permission/update").post(function (req, res) {
  fs.createReadStream('./data/permissionsUpdate.json').pipe(res.type('json'));
});

api.route("/checkout").post(function (req, res) {
  res.send({
    status: '200',
    message: 'Your document has been checked out successfully'
  });
});
api.route("/cancelcheckout").post(function (req, res) {
  res.send({
    status: '200',
    message: 'Your document has been checked out successfully'
  });
});

api.route("/permission/search").post(function (req, res) {
  //var userTypeaheadData = JSON.parse(fs.readFileSync('./data/permissionSearchUsers.json', 'utf8'));
  //res.send(JSON.stringify({"userList" : _.filter(userTypeaheadData, function (u) { return u.name.toLowerCase().search(req.body.searchValue.toLowerCase()) !== -1; })}));
  fs.createReadStream('./data/permissionSearchUsers.json').pipe(res.type('json'));
});
api.route("/permission/add").post(function (req, res) {
  var validList, invalidList,
    userTypeaheadData = JSON.parse(fs.readFileSync('./data/permissionSearchUsers.json', 'utf8')),
    userTypeaheadDataUserids = _.pluck(userTypeaheadData, 'userId'),
    values = req.body.searchValue.split(',');

  validList = _.filter(values, function (u) { return _.contains(userTypeaheadDataUserids, u); });
  invalidList = _.filter(values, function (u) { return !_.contains(userTypeaheadDataUserids, u); });

  res.send(JSON.stringify({
    "valid" : _.filter(userTypeaheadData, function (u) { return _.contains(validList, u.userId.toLowerCase()); }),
    "invalid": invalidList.join(",")})
  );
});
// api.route("/permission/view").get(function (req, res) {
//   fs.createReadStream('./data/file-permissions-error.json').pipe(res.type('json'));
// });
api.route("/permission/view").get(function (req, res) {
  fs.createReadStream('./data/file-permissions.json').pipe(res.type('json'));
});

api.route("/permission/fetchdirectreport").post(function (req, res) {
  fs.createReadStream('./data/directreport-permissions.json').pipe(res.type('json'));
});

api.route("/node/versions").get(function (req, res) {
 if(req.param('allversions') === "true") {
   fs.createReadStream('./data/versions.json').pipe(res.type('json'));
 } else {
   fs.createReadStream('./data/fileProperties.json').pipe(res.type('json'));
   //fs.createReadStream('./data/fileProperties-error.json').pipe(res.type('json'));
 }
});

api.route("/document/metadata/*").post(function (req, res) {
  res.send(200);
});

api.route("/upload/*").post(function (req, res) {
  res.send('');
});

api.route("/permission/bulkupdate").post(function (req, res) {
  res.send('');
});

api.route("/report/*").post(function (req, res) {
  res.send('');
});

/************************ MOCK TASKS ************************/
api.route("/workflow/tasklist").get(function (req, res) {
  fs.createReadStream('./data/tasks.json').pipe(res.type('json'));
});

api.route("/workflow/taskdetails").get(function (req, res) {
  var tasks = JSON.parse(fs.readFileSync('./data/tasks.json', 'utf8'));
  var task = _.find(tasks, function (task) {
    return task.taskId === req.query.taskId;
  });

  res.send(task);
})

api.route("/workflow/*").post(function (req, res) {
  res.send(req.body);
});
/************************ END TASKS ************************/

// PROXIED STUFF
var tokenTime, token;
api.route('/*').get(function (req, res) {
  var API_PATH = config.API_PATH,
      TOKEN_PATH = config.TOKEN_PATH,
      EXPIRY_TIME = config.TOKEN_EXPIRY_TIME,
      now = new Date;

  function proxyRequest() {
    var newurl = API_PATH + req.url + (_.isEmpty(req.query) ? "?" : "&") + "alf_ticket=" + token;
    console.log("PROXYING: ", newurl);
    request(newurl).pipe(res);
  }

  if (token && tokenTime && now - tokenTime < EXPIRY_TIME) {
    // we already have a valid token
    proxyRequest();
  } else {
    // get a new token, then make the request
    request(TOKEN_PATH, function (requ, resp) {
      if (!resp) {
        console.log("Token problem...");
        return;
      }
      xml2js.parseString(resp.body, function (err, result) {
        tokenTime = new Date;
        token = result.ticket;
        proxyRequest();
      });
    })
  };
});

// html5 routing
// var staticDir = path.join(__dirname, "dist");
// app.use("/alfext/ui", express.static(staticDir));
// app.get('/alfext/ui/*', function(req, res){
//   console.log("====== CATCHALL =======>", req.url);
//   res.sendfile(path.join(staticDir, 'index.html'));
// })
app.use("/alfext/ui", express.static(path.join(__dirname, "dist")));

app.listen(3000);
console.log('Listening on port ');
