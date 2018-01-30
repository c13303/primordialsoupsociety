/* Fromage Interactif ALL RIGHTS RESERVED */
$(document).ready(function () {
    /* CANVAS */
    if($('#canvasDiv').length < 1)
    {
        return null;
    }
    
    var canvasDiv = document.getElementById('canvasDiv');
    canvas = document.createElement('canvas');
    canvas.setAttribute('width', $('#canvasDiv').width());
    canvas.setAttribute('height', $('#canvasDiv').height());
    canvas.setAttribute('id', 'canvas');
    canvasDiv.appendChild(canvas);
    if (typeof G_vmlCanvasManager != 'undefined') {
        canvas = G_vmlCanvasManager.initElement(canvas);
    }
    context = canvas.getContext("2d");
    canvas.onselectstart = function () {
        return false;
    }
    
    drawing = new Image();
    drawing.src = $('#source').data('source');; // can also be a remote URL e.g. http://
    drawing.onload = function() {
       context.drawImage(drawing,0,0);
       savedata();
    };
    
    
    function savedata(){
        var canvas_id = "canvas";
        var canvas = document.getElementById(canvas_id);
        var dataURL = canvas.toDataURL();
        $('#appbundle_map_file').val(dataURL);
        $('#appbundle_user_file').val(dataURL);
        $('#appbundle_card_file').val(dataURL);
    }

    var CLIPBOARD = new CLIPBOARD_CLASS("canvas", true);

    /**
     * image pasting into canvas
     * 
     * @param {string} canvas_id - canvas id
     * @param {boolean} autoresize - if canvas will be resized
     */
    function CLIPBOARD_CLASS(canvas_id, autoresize) {
        
        var _self = this;
        var canvas = document.getElementById(canvas_id);
        var ctx = document.getElementById(canvas_id).getContext("2d");

        //handlers
        document.addEventListener('paste', function (e) {
            _self.paste_auto(e);
        }, false);

        //on paste
        this.paste_auto = function (e) {
            if (e.clipboardData) {
                var items = e.clipboardData.items;
                if (!items)
                    return;
                
                //access data directly
                for (var i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("image") !== -1) {
                        //image
                        $('#canvasDiv').css('background','none');
                        var blob = items[i].getAsFile();
                        if(blob.size > 500000000)
                        {
                            alert('Image Trop FAT !');
                            return(null);
                        }
                        
                        var URLObj = window.URL || window.webkitURL;
                        var source = URLObj.createObjectURL(blob);
                        this.paste_createImage(source);

                    }
                }
                e.preventDefault();
            }
        };
        //draw pasted image to canvas
        this.paste_createImage = function (source) {
            var pastedImage = new Image();
            pastedImage.onload = function () {               

                ctx.drawImage(pastedImage, 0, 0,canvas.width,canvas.height);                
                color_canvas();
            };
            pastedImage.src = source;

        };



    }


    function color_canvas()
    {
        var tr = $('#sensitivity').data('tr');
        var tg = $('#sensitivity').data('tg');
        var tb = $('#sensitivity').data('tb');
        
        /* cHANGE COLOR */
        var canvas_id = "canvas";
        var canvas = document.getElementById(canvas_id);
        var ctx = document.getElementById(canvas_id).getContext("2d");
       

        var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);

        var pix = imgd.data;
        
        for (var i = 0, n = pix.length; i < n; i += 4) {
            // 109 111 101 = dark
            /*
             pix[i  ] = 255 - pix[i  ];
             pix[i + 1] = 255 - pix[i + 1]; 
             pix[i + 2] = 255 - pix[i + 2]; 
             */

            var r = pix[i  ];
            var g = pix[i + 1];
            var b = pix[i + 2];
            if(!($('#sensitivity').val()))
            {
                 var sensivity = 109;
            }
            else
            {
                var sensivity = parseInt($('#sensitivity').val());
            }
           

            if (r < sensivity && g < sensivity && b < sensivity) {
                pix[i  ] = tr;
                pix[i + 1] = tg;
                pix[i + 2] = tb;
            } else
            {
                pix[i + 3] = 0;
            }
        }

        ctx.putImageData(imgd, 0, 0);
        
        savedata();
    }
    
    $('#upfile').change(function(){
       // $('.canvasloader').show();
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
         $('#canvasDiv').css('background','none');
        setTimeout(function(){
            loadImage();
        },1000)
        
    })
    function loadImage() {
        var input, file, fr, img;
        
        if (typeof window.FileReader !== 'function') {
            write("The file API isn't supported on this browser yet.");
            return;
        }

        input = document.getElementById('upfile');
        if (!input) {
            console.log("Um, couldn't find the imgfile element.");
        } else if (!input.files) {
            console.log("This browser doesn't seem to support the `files` property of file inputs.");
        } else if (!input.files[0]) {
            console.log("Please select a file before clicking 'Load'");
        } else {
            file = input.files[0];
            fr = new FileReader();
            fr.onload = createImage;
            fr.readAsDataURL(file);
          

            
        }

        function createImage() {
            img = new Image();
            img.onload = imageLoaded;
            img.src = fr.result;
        }

        function imageLoaded() {
            var canvas = document.getElementById("canvas")

            var ctx = canvas.getContext("2d");
            
            ctx.drawImage(img, 0, 0,canvas.width, canvas.height);
           color_canvas();
           $('.canvasloader').hide();
        }

       
    }
    
    
});