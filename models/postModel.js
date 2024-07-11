const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: [
          "Agriculture",
          "Business",
          "Education",
          "Entertainment",
          "Art",
          "Investment",
          "Uncategorized",
          "Weather",
        ],
        message: "{VALUE} is not a supported category",
      },
      required: [true, "Category is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail is required"],
    },
  },
  { timestamps: true }
);

postSchema.index({ title: 1 });

module.exports = mongoose.model("Post", postSchema);
