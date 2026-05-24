const loader = document.getElementById("page-loader");

/*
    Show loader during page navigation
*/
document.addEventListener("click", function(e){

    const link = e.target.closest("a");

    if(!link) return;

    const href = link.getAttribute("href");

    /*
        Ignore:
        - empty links
        - hashes
        - external links
        - new tabs
    */
    if(
        !href ||
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        link.target === "_blank" ||
        link.hasAttribute("download")
    ){
        return;
    }

    /*
        Activate loader
    */
    loader.classList.add("active");
});

/*
    Hide loader after page fully loads
*/
window.addEventListener("pageshow", () => {
    loader.classList.remove("active");
});