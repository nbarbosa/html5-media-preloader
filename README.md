# HTML5 Media Preloader
A queue-based HTML5 media preloader for games & other media-heavy apps. It works for audio, images, and documents.

## How to use
	var preloader = new MediaPreloader({
	            inclusiveItems: [], // optional list of resources in the format "{ href: 'path_to_resource' }""
	    href: 'path/to/json/response', // response example: [{href: 'image1.jpg'}, .. {href:'audio1.mp3'}] - this is the list of resources to be loaded
	    fromRoot: 'path/to/root' // optional root to prepend to every href in response
	    updateCallback: function (percent) {
	      // callback to update a progress bar, for example
	    },
	    doneCallback: function (successCount, errorCount) {
	        if (errorCount > 0) {
	            console.info('Not all resources have been loaded.');
	        }
	        // what to do when complete?
	    },
	    error: function (error) {
	        console.log(error);
	        // what to do when an error occurs?
	    }
	});

## License
Copyright 2015 Natã Barbosa.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.