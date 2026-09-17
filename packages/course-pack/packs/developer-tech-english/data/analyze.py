import json

# 读取07.json
with open('07.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 分析主题分布
sentences = data['data']
print(f"总句子数: {len(sentences)}")
print("\n前50句（按序号）：")
for i, s in enumerate(sentences[:50]):
    print(f"{i+1}. {s['chinese']}")
