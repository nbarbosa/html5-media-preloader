(function(root, undefined) {

  "use strict";


function MediaPreloader(options) {

    var self = this;
    this.contents = null;

    var defaults = {
        fromRoot: true,
        inclusiveItems: []
    };

    // merge defaults with options
    if (typeof options !== 'undefined') {
        for (var prop in defaults) {
            if (prop in options) {
                continue;
            }

            options[prop] = defaults[prop];
        }
    }


    this.options = options;


    try {
        if (typeof this.options.href === 'undefined') {
            throw new Error('No target file has been informed.');
        }

        var xhr = new window.XMLHttpRequest();
        xhr.open("GET", this.options.href, true);

        xhr.onreadystatechange = function () {

            try {
                if (xhr.readyState === 4) {
                    // request OK   
                    if (xhr.status === 200) {
                        if (xhr.responseText !== '' && JSON.stringify(JSON.parse(xhr.responseText)) !== '{}') {
                            self.contents = JSON.parse(xhr.responseText);
                            self.queueContents();
                        } else {
                            throw new Error('Response is empty');
                        }
                    } else {
                        throw new Error(xhr.statusText);
                    }
                }
            } catch (err) {
                self.options.error(err);
            }

        };


        // Handle network errors
        xhr.onerror = function (err) {
            throw new Error(err);
        };

        // Make the request
        xhr.send();
    } catch (err) {
        if (typeof self.options.error !== 'undefined') {
            self.options.error(err);
        } else {
            console.log(err);
        }
    }

}

MediaPreloader.prototype.queueContents = function () {
    var self = this;
    var am = new AssetManager();


    if (typeof this.contents.item === 'undefined') {
        throw new Error('"item" collection does not exist.');
    }

    if (this.options.fromRoot === true) {
        if (typeof self.contents.root === 'undefined' || self.contents.root === '') {
            throw new Error('"root" path does not exist.');
        }
    }

    if (this.options.inclusiveItems.length > 0) {
        self.contents.item.push.apply(self.contents.item, this.options.inclusiveItems);
    }

    for (var i = 0; i < this.contents.item.length; i++) {
        var item = this.contents.item[i];

        if (typeof item.href !== 'undefined') {
            if (this.options.fromRoot === true) {
                item.href = self.contents.root + '/' + item.href;
            }
            am.queueDownload(item);
        }
    }
    am.totalCount = am.downloadQueue.length;
    am.downloadAll(self.options.updateCallback, self.options.doneCallback);


};

function AssetManager () {
    this.totalCount = 0;
    this.successCount = 0;
    this.errorCount = 0;
    this.downloadQueue = [];
    this.percentCompleted = 0;
}

AssetManager.prototype.download = function (success, error, cb) {
    function isImage(path) {
        return (/\.(jpg|jpeg|png|gif|svg)$/).test(path.toLowerCase());
    }

    function isAudio(path) {
        return (/\.(oga|wav|mp3|m4a)$/).test(path.toLowerCase());
    }

    if (this.downloadQueue.length > 0) {

        var item = this.downloadQueue.shift();

        var path = item.href;

        if (isImage(path)) {
            var img = new Image();
            img.src = path;
            try {

                img.addEventListener('load', function () {
                    if (success) {
                        success();
                    }

                    if (cb) {
                        cb();
                    }
                });

                
                img.addEventListener('error', function () {
                    if (error) {
                        error();
                    }

                    if (cb) {
                        cb();
                    }
                });
        
            } catch (e) {
                if (error) {
                    error();
                }

                if (cb) {
                    cb();
                }
            }


        } else if (isAudio(path)) {
            try {

                var audio = new Audio();
            
                audio.volume = 0;
                audio.autoplay = true;
                var onceReady = false;

                function onready() {
                    if (onceReady === false) {
                        onceReady = true;

                        audio.pause();

                        audio = null;

                        if (success) {
                            success();
                        }

                        if (cb) {
                            cb();
                        }
                    }

                }

                function onerror() {
                    if (error) {
                        error();
                    }

                    if (cb) {
                        cb();
                    }
                }

                audio.addEventListener('canplay', onready);
                audio.addEventListener('canplaythrough', onready);
                audio.addEventListener('loadeddata', onready);

                audio.addEventListener('error', onerror);
                
        
                audio.src = path;
            
                audio.load();
            } catch (e) {
                if (error) {
                    error();
                }

                if (cb) {
                    cb();
                }

            }

        // document
        } else {

            var xhr = new window.XMLHttpRequest();
            xhr.onload = function () {

                try {
                    // request OK   
                    if (xhr.status === 200) {
                        if (success) {
                            success();
                        }

                        if (cb) {
                            cb();
                        }

                    } else {
                        throw new Error('Error loading resource.');
                    }

                } catch (err) {
                    if (error) {
                        error();
                    }

                    if (cb) {
                        cb();
                    }
                }
            };

            // Handle network errors
            xhr.onerror = function () {
                if (error) {
                    error();
                }

                if (cb) {
                    cb();
                }

            };

            xhr.open("GET", path);

            // Make the request
            xhr.send();


        }
        // queue is empty
    }
};
AssetManager.prototype.downloadAll = function (updateCallback, downloadCallback) {

    var self = this;
    if (this.downloadQueue.length === 0) {
        if (typeof downloadCallback === 'function') {
            throw new Error('Nothing to load, queue is empty.');
        }
    }


    function next() {
        self.updateProgress(updateCallback);
        if (self.downloadQueue.length > 0) {
            self.download(function () { self.countSuccess(); }, function () { self.countError(); }, next);
            // queue is empty
        } else {
            if (typeof downloadCallback === 'function') {
                downloadCallback(self.successCount, self.errorCount);
            }
        }
    }

    next();

};
AssetManager.prototype.countSuccess = function () {
    this.successCount += 1;
};

AssetManager.prototype.countError = function () {
    this.errorCount += 1;
};
AssetManager.prototype.queueDownload = function (item) {
    this.downloadQueue.push(item);
};

AssetManager.prototype.updateProgress = function (updateCallback) {
    this.percentCompleted = parseInt((this.successCount + this.errorCount) / this.totalCount * 100, 10);
    if (typeof updateCallback === 'function') {
        updateCallback(this.percentCompleted);
    }
};

// Version
MediaPreloader.VERSION = '0.0.1';
root.MediaPreloader = MediaPreloader;

}(this));
