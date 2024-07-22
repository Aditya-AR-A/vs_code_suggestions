import os

from groq import Groq

client = Groq(
    # This is the default and can be omitted
    api_key=os.environ.get("GROQ_API_KEY"),
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "system",
            "content": "you are code completion bot."
        },
        {
            "role": "user",
            "content": "function add(a, b) {",
        }
    ],
    model="llama3-8b-8192",
)

print(chat_completion.choices[0].message.content)