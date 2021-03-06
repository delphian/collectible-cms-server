var busboy = require('connect-busboy');
var fs     = require('fs');
var crypto = require("crypto");
var User   = require('../../models/user');
var File   = require('../../models/file');
var config = require('../../../config');
var Jimp   = require('jimp');
var Promise = require('promise');

/**
 * @apiDefine apiGroupFile File
 *
 * <h4 id="fileObject" class="object-anchor">File Object</h4>
 * <pre>
 * {<br />
    // User id that owns the file.<br />
    userId: { type: Schema.Types.ObjectId, ref: 'User' },<br />
    // Name of file on disk.<br />
    name: String,<br />
    // If the file is public or private<br />
    public: Boolean<br />
    // Base url to access file, does not include trailing slash.<br />
    baseUrl: String<br />
 * }
 * </pre>
 */

module.exports = function(app, router) {
    /**
     * @api {get} /file Read All
     * @apiPermission apiPermissionPublic
     * @apiGroup apiGroupFile
     * @apiName ReadAll
     * @apiDescription 
     *     Read details for all files. Files owned by the requestor will always
     *     be returned. If role is <code>Admin</code> then all files will be returned, 
     *     otherwise only files marked public will be returned. Results are sorted in
     *     descending order of creation time (most recent first).
     * @apiParam {Number} [offset=1] The number of records to skip.
     * @apiParam {Number} [limit=10] The number of records to retrieve.
     * @apiUse apiSuccessStatus
     * @apiSuccess {String} data An array of file objects.
     * @apiSuccessExample One File Found
     *     HTTP/1.1 200 OK
     *     {
     *         "status": true,
     *         "data": [ 
     *             <a href="#fileObject">File Object</a> 
     *         ]
     *     }
     * @apiSuccessExample No Files Found
     *     HTTP/1.1 200 OK
     *     {
     *         "status": true,
     *         "data": []
     *     }
     */
    router.get('/file', function(req, res) {
        var offset = parseInt(req.query.offset || 0);
        var limit  = parseInt(req.query.limit  || 10);
        var search = { };
        if (!req.user.isAdmin()) {
            search.$or = [ { userId: req.user._id }, { public: true } ];
        }
        // Sort by creation time, descending order.
        File.find(search, function(err, files) {
            if (err) res.notFound(err);
            var promises = [];
            for (var i = 0; i < files.length; i++) {
                promises.push(files[i].getDTO().loadAll());
            }
            Promise.all(promises).then(function(dtos) {
                res.json({
                    "status": true,
                    "data": dtos
                });
            }).catch(function(err) {
                res.failure(err);
            })
        }).skip(offset).limit(limit).sort( [['_id', -1]] );
    });
    /**
     * @api {get} /user/:id/file Read All From User
     * @apiPermission apiPermissionPublic
     * @apiGroup apiGroupFile
     * @apiName ReadAllFromUser
     * @apiDescription 
     *     Read details for all of user's uploaded files. Files owned by the requestor will
     *     always be returned. If role is <code>Admin</code> then all files will be returned, 
     *     otherwise only files marked public will be returned. Results are sorted in
     *     descending order of creation time (most recent first).
     * @apiParam {Number} id The unique user identifier.
     * @apiParam {Number} [offset=1] The number of records to skip.
     * @apiParam {Number} [limit=10] The number of records to retrieve.
     * @apiUse apiSuccessStatus
     * @apiSuccess {String} data An array of file objects.
     * @apiSuccessExample One File Found
     *     HTTP/1.1 200 OK
     *     {
     *         "status": true,
     *         "data": [ 
     *             <a href="#fileObject">File Object</a> 
     *         ]
     *     }
     * @apiSuccessExample No Files Found
     *     HTTP/1.1 200 OK
     *     {
     *         "status": true,
     *         "data": []
     *     }
     */
    router.get('/user/:id/file', function(req, res) {
        var offset = parseInt(req.query.offset || 0);
        var limit  = parseInt(req.query.limit  || 10);
        var search = {
            userId: req.params.id,
        }
        if (!req.user.isAdmin()) {
            search.$or = [ { userId: req.user._id }, { public: true } ];
        }
        // Sort by creation time, descending order.
        File.find(search, function(err, files) {
            if (err) res.notFound(err);
            var promises = [];
            for (var i = 0; i < files.length; i++) {
                promises.push(files[i].getDTO().loadAll());
            }
            Promise.all(promises).then(function(dtos) {
                res.json({
                    "status": true,
                    "data": dtos
                });
            }).catch(function(err) {
                res.failure(err);
            })
        }).skip(offset).limit(limit).sort( [['_id', -1]] );
    });
    /**
     * @api {get} /file/:id Read One
     * @apiPermission apiPermissionPublic
     * @apiGroup apiGroupFile
     * @apiName ReadOne
     * @apiDescription
     *     Read details for a single file uploaded by user. A File owned by the requestor will
     *     always be returned. A role of <code>Admin</code> will always have file returned,
     *     otherwise only if the file is marked public will it be returned.
     * @apiParam {Number} id The unique file identifier.
     * @apiUse apiSuccessStatus
     * @apiSuccess {String} data A single file object.
     * @apiSuccessExample File Found
     *     HTTP/1.1 200 OK
     *     {
     *         "status": true,
     *         "data": <a href="#fileObject">File Object</a>
     *     }
     * @apiUse apiErrorExampleNotFound
     */
    router.get('/file/:id', function(req, res) {
        var search = {
            "_id": req.params.id,
        }
        if (!req.user.isAdmin()) {
            search.$or = [ { userId: req.user._id }, { public: true } ];
        }
        File.find(search, function(err, files) {
            if (err) {
                res.notFound();
            } else {
                var file = files.pop();
                var dto = (file == null) ? null : file.getDTO();
                res.json({
                    "status": true,
                    "data": dto
                });
            }
        });
    });
    /**
     * @api {post} /user/:id/file Create
     * @apiPermission apiPermissionUser
     * @apiGroup apiGroupFile
     * @apiName Create
     * @apiDescription
     *     Upload a file into user's file repository. A 10 character random 
     *     hash will be prepended to the filename to avoid conflicts.
     * @apiUse apiHeaderAccessToken
     * @apiUse apiSuccessStatus
     * @apiSuccess {JSON} data A single file object.
     * @apiSuccessExample File Created
     *     HTTP/1.1 200 OK
     *     {
     *         "status": true,
     *         "data": <a href="#fileObject">File Object</a>
     *     }
     * @apiUse apiErrorExampleAccessToken
     * @apiUse apiErrorExampleNotAuthorized
     * @apiUse apiErrorExampleFailure
     */
    router.post('/user/:id/file', function(req, res) {
        if (!req.user.isUser()) {
            res.notAuthorized();
        } else {
            if (req.busboy) {
                req.pipe(req.busboy);       
                req.busboy.on('file', function (fieldname, fileData, filename) {
                    var file = new File();
                    file.userId = req.params.id;
                    file.name = crypto.randomBytes(5).toString('hex') + '-' + filename;                    
                    file.public = true;
                    file.saveFile(fileData).then(function() {
                        file.getDTO().loadAll().then(function(dto) {
                            res.json({
                                "status": true,
                                "data": dto
                            });
                        });
                    }).catch(function(err) {
                        res.failure(err);
                    });
                });
            }
        }
    });
    /**
     * @api {delete} /file/:id Delete
     * @apiPermission apiPermissionUser
     * @apiGroup apiGroupFile
     * @apiName Delete
     * @apiDescription
     *     A role of <code>Admin</code> may delete any file object.
     *     A role of <code>User</code> may only delete their own
     *     file object. The physical file will be removed from disk.
     * @apiUse apiHeaderAccessToken
     * @apiParam {Number} id The unique file identifier to delete.
     * @apiUse apiSuccessStatus
     * @apiSuccessExample File Removed
     *     HTTP/1.1 200 OK
     *     {
     *         "status": true,
     *     }
     * @apiUse apiErrorExampleAccessToken
     * @apiUse apiErrorExampleNotAuthorized
     * @apiUse apiErrorExampleFailure
     * @apiUse apiErrorExampleNotFound
     */
    router.delete('/file/:id', function(req, res) {
        if (!req.user.isUser()) {
            res.notAuthorized();
        } else {
            File.findById(req.params.id, function(err, file) {
                if (err) {
                    res.notFound();
                } else {
                	if (!req.user.isAdmin() && req.user._id != file.userId) {
                		res.notAuthorized();
                	} else {
	                    file.remove(function(err, file) {
	                        if (err) {
	                            res.failure(err);
	                        } else {
	                            res.json({
	                                "status": true,
	                            });
	                        }
	                    });
                	}
                }
            });
        }
    });
}
