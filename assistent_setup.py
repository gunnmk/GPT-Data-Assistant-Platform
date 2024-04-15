# I recommend using a Jupyter notebook to run assistant_setup.py

# pip install openai

from openai import OpenAI

api_key = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

# List assistants
my_assistants = client.beta.assistants.list(
    order="desc",
    limit="20",
)
print(my_assistants.data)


# List assistant files
assistant_files = client.beta.assistants.files.list(
  assistant_id="asst_...."
)
print(assistant_files)


# Modify Assistant
my_updated_assistant = client.beta.assistants.update(
  "asst_abc123",
  instructions="""
  1.Before answering, check whether the answer is in line with the instructions.
  2.Only answer questions on SQL, Python, PowerBI, Databricks and business topics. If the question is outside these topics, inform them that you are not trained to answer and suggest contacting the development team
  3.Use the file "NAME_FILE" (file ID: XXX) containing the columns "YZX" and "XYX".
  5. Create a Spark SQL query for the "TABLE_NAME" table. The query must be presented in a single line, starting with "#START_QUERY" and ending with "#END_QUERY".
  """,
  name="Data Analyst",
  tools=[{"type": "retrieval"},{"type": "code_interpreter"}],
  model="gpt-4-turbo",
  file_ids=["file-abc123"],
)
print(my_updated_assistant)
