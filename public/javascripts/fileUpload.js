// we register our filepond plugins
FilePond.registerPlugin( // this tells filepond which additional plugins it will use 
    FilePondPluginFileEncode,
    FilePondPluginImagePreview,
    FilePondPluginImageResize
);
// we then change our filepond style
FilePond.setOptions({
    stylePanelAspectRatio: 150/100,
    imageResizeTargetWidth: 100,
    imageResizeTargetHeight: 150
});
FilePond.parse(document.body);