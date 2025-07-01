from final_excel_chatbot import chatbot_answer

def main():
    print("🔍 Excel Chatbot is ready. Type your question or 'exit' to quit.")
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("👋 Goodbye!")
            break
        response = chatbot_answer(user_input)
        print(f"Bot: {response}\n")

if __name__ == "__main__":
    main()
