const mongoose = require("mongoose");
const marked = require("marked").setOptions({}); // conveerta markdown u html
const slugify = require("slugify");
const createDomPurify = require("dompurify");
const { JSDOM } = require("jsdom"); // {} znaci da dohvaca samo JSDOM specificno
const dompurify = createDomPurify(new JSDOM().window); // cisti HTML i stiti

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    markdown: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    sanitizedHtml: {
        type: String,
        required: true,
    },
});

articleSchema.pre("validate", function (next) {
    if (this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true }); // Strict true brise tipa "nesto:" dvotocku
    }

    if (this.markdown) {
        this.sanitizedHtml = dompurify.sanitize(
            marked(this.markdown, { mangle: false })
        ); // convertira md pa cisti kod od malicious koda
    }

    next();
});

module.exports = mongoose.model("Article", articleSchema);
