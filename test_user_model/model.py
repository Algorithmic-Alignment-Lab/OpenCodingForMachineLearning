# Load model directly
from transformers import AutoTokenizer, AutoModelForCausalLM

tokenizer = AutoTokenizer.from_pretrained("gpt2")
model = AutoModelForCausalLM.from_pretrained("gpt2")

# input_text = "Hi, how are you?"
# encoded_input = tokenizer(input_text, return_tensors="pt")
# encoded_output = model.generate(**encoded_input)
# string_output = tokenizer.decode(encoded_output[0])
# print(string_output)