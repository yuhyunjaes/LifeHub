<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quill 텍스트 에디터</title>
    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
    <style>
        #editor-container {
            height: 300px;
        }
    </style>
</head>
<body>
<div id="editor-container"></div>
<button onclick="saveContent()">as</button>
<script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
<script>
    var toolbarOptions = [
        ['bold', 'italic', 'underline'],              // toggled buttons
        ['blockquote', 'code-block'],

        [{ 'header': 1 }, { 'header': 2 }],          // custom button values
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],// superscript/subscript
        [{ 'indent': '-1' }, { 'indent': '+1' }],    // outdent/indent
        [{ 'direction': 'rtl' }],                    // text direction

        [{ 'size': ['small', false, 'large', 'huge'] }], // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

        [{ 'color': [] }, { 'background': [] }],     // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],                           // text alignment options

        ['clean'],                                   // remove formatting button
        ['image', 'divider']                         // image insertion and divider
    ];

    var quill = new Quill('#editor-container', {
        theme: 'snow',
        modules: {
            toolbar: {
                container: toolbarOptions,
                handlers: {
                    'divider': function() {
                        var range = this.quill.getSelection();
                        if (range) {
                            this.quill.insertText(range.index, '\n', Quill.sources.USER);
                            this.quill.insertText(range.index + 1, '———', Quill.sources.USER);
                            this.quill.insertText(range.index + 4, '\n', Quill.sources.USER);
                        }
                    }
                }
            }
        }
    });

    function saveContent() {
        // Quill 에디터에서 HTML 내용 가져오기
        const html = quill.root.innerHTML;

        alert(html)
    }
</script>
</body>
</html>
