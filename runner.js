$(document).ready(function() {
    // call as target.html?test=1&spec=sugar7/index
    if (window.location.href.indexOf('test=1') !== -1)
    {
        cssTestRunner.load();
    }
});
