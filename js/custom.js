// Offset for Site Navigation
$('#siteNav').affix({
	offset: {
		top: 100
	}
})
</body>
<script>

const editor = document.getElementById("articleEditor");
const title = document.getElementById("articleTitle");
const counter = document.getElementById("wordCount");

function updateWordCount(){

    const text = editor.value.trim();

    const words = text === ""
        ? 0
        : text.split(/\s+/).length;

    counter.textContent =
        "Words: " + words;
}

editor.addEventListener(
    "input",
    updateWordCount
);

function saveDraft(){

    localStorage.setItem(
        "blogTitle",
        title.value
    );

    localStorage.setItem(
        "blogDraft",
        editor.value
    );

    alert("Draft Saved");
}

function loadDraft(){

    title.value =
        localStorage.getItem("blogTitle") || "";

    editor.value =
        localStorage.getItem("blogDraft") || "";

    updateWordCount();

    alert("Draft Loaded");
}

function clearDraft(){

    if(confirm("Delete draft?")){

        localStorage.removeItem(
            "blogTitle"
        );

        localStorage.removeItem(
            "blogDraft"
        );

        title.value = "";
        editor.value = "";

        updateWordCount();
    }
}

loadDraft();

</script>