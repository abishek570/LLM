# Hotel Review Sentiment Analysis with BERT

This project demonstrates how to fine-tune a pre-trained BERT model (`bert-base-uncased`) for a binary sentiment classification task using a dataset of hotel reviews. 

## Overview

The Jupyter notebook (`app.ipynb`) covers the end-to-end workflow of natural language processing using Hugging Face's `transformers` library and PyTorch:
1. **Data Loading**: Reading hotel reviews from a CSV file (`hotel_review.csv`).
2. **Data Splitting**: Dividing the data into training and testing sets.
3. **Tokenization**: Converting the text reviews into format that BERT can understand using `BertTokenizer`.
4. **Dataset Preparation**: Wrapping the tokenized data into a custom PyTorch `Dataset` class.
5. **Model Fine-Tuning**: Training `BertForSequenceClassification` using the Hugging Face `Trainer` API.
6. **Inference**: Testing the trained model with sample sentences.
7. **Saving the Model**: Saving the model and tokenizer to a local directory (`bert-hotel-sentiment/`).
8. **Restoring the Model**: Loading the fine-tuned model from the directory and using it for new predictions.

## Requirements

Ensure you have the necessary libraries installed. Primary dependencies include:
- `pandas`
- `scikit-learn`
- `transformers`
- `torch`

## Dataset Requirements
The file `hotel_review.csv` must be present in the same directory as the notebook and contain at least two columns:
- `review`: The string text of the review.
- `label`: An integer representing the sentiment (`0` for Negative, `1` for Positive).

## Usage

1. Open the notebook `app.ipynb` in Jupyter Notebook or VS Code.
2. Run the cells sequentially. 
3. After the training step is completed, the model checkpoints will be created in `./results` and the final trained model will be exported to `bert-hotel-sentiment/`.
4. The final cells demonstrate how to load the saved model and perform inference on arbitrary review strings.
