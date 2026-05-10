"""Generate sample_reading_2.pkg and sample_vocabulary_2.pkg"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# ── sample_reading_2.pkg ──
reading2 = {
    "format": "zenreading-pkg",
    "version": 1,
    "meta": {
        "name": "样例试题2",
        "description": "第二套日语阅读试题。",
        "gradient": "linear-gradient(135deg, #1a5276, #2980b9, #5499c7)",
        "sets": {
            "ja": { "name": "样例试题2", "description": "第二套日本語読解練習。" }
        }
    },
    "articles": [
        {
            "id": 1,
            "title": "日本の食文化とグローバル化",
            "description": "和食のユネスコ無形文化遺産登録を契機に、日本食の国際的普及とその変容を考察する。",
            "difficulty": 4,
            "language": "ja",
            "type": "reading",
            "image": "",
            "gradient": "linear-gradient(135deg, #8b4513, #a0522d, #cd853f)",
            "content": "2013年、「和食 日本人の伝統的な食文化」がユネスコ無形文化遺産に登録された。これを契機に、世界中で日本食ブームが加速し、寿司やラーメン、天ぷらといった料理は今や世界中の都市で親しまれている。しかし、その急速な普及の裏で、「本物の和食」とは何かという問いが改めて浮上している。\n\n海外の日本食レストランの数はこの10年で約3倍に増加した。農林水産省の調査によれば、2023年時点で世界に約18万店の日本食レストランが存在する。しかし、その多くは現地の嗜好に合わせて大きくアレンジされており、例えば「カリフォルニアロール」のような巻き寿司は、日本の伝統的な寿司とは大きく異なる。\n\nこの状況を「食文化の毀損」と見るか、「食文化の進化」と見るかは専門家の間でも意見が分かれる。一方で、伝統を守ることだけが文化の継承ではなく、異文化との接触を通じて新たな価値が生まれることもまた事実である。\n\n重要なのは、「本物」「偽物」という二項対立を超えて、多様化する日本食の全体像を理解し、その中で核となる価値を見極めていくことではないだろうか。",
            "questions": [
                {
                    "id": 1,
                    "text": "和食がユネスコ無形文化遺産に登録されたのは何年か。",
                    "options": ["2010年", "2013年", "2015年", "2018年"],
                    "answer": 1
                },
                {
                    "id": 2,
                    "text": "本文によれば、2023年時点で世界に約何店の日本食レストランが存在するか。",
                    "options": ["約5万店", "約10万店", "約18万店", "約25万店"],
                    "answer": 2
                },
                {
                    "id": 3,
                    "text": "筆者が最終的に主張していることは何か。",
                    "options": [
                        "海外の日本食はすべて偽物である",
                        "伝統的な和食だけを守るべきである",
                        "多様化する日本食の全体像を理解し核となる価値を見極めるべきである",
                        "カリフォルニアロールは寿司ではない"
                    ],
                    "answer": 2
                }
            ]
        },
        {
            "id": 2,
            "title": "宇宙開発の商業化",
            "description": "民間企業による宇宙開発の現状と、それに伴う法的・倫理的課題について。",
            "difficulty": 3,
            "language": "ja",
            "type": "reading",
            "image": "",
            "gradient": "linear-gradient(135deg, #1a1a4e, #2d2d6b, #4a4a8f)",
            "content": "近年、SpaceXやBlue Originなど民間企業による宇宙開発が急速に進展している。かつては国家主導だった宇宙開発は、今や民間資本と技術革新によって新たな段階に入った。ロケットの再利用技術の確立により打ち上げコストは大幅に低下し、宇宙へのアクセスは格段に容易になった。\n\nしかし、この商業化の波は新たな課題も生み出している。第一に、スペースデブリ（宇宙ゴミ）の問題である。多数の小型衛星が打ち上げられることで、軌道上の衝突リスクが高まっている。第二に、月や小惑星の資源採掘に関する法的枠組みが未整備である。現行の宇宙条約は国家間の取り決めであり、民間企業の活動を十分に規制できていない。\n\nさらに、宇宙開発の民主化は、一方で「宇宙の商業化」による格差の拡大も懸念される。富裕層向けの宇宙旅行が実現する一方で、宇宙開発の恩恵が一部の企業や個人に集中する構造は、新たな社会的不平等を生む可能性がある。\n\n人類が宇宙に進出することの意義は計り知れないが、その歩みが持続可能で公正なものとなるよう、技術開発と並行して国際的なルール作りを急ぐ必要がある。",
            "questions": [
                {
                    "id": 1,
                    "text": "本文で言及されているロケット技術の革新は何か。",
                    "options": ["核融合推進", "ロケットの再利用技術", "電磁カタパルト", "太陽帆"],
                    "answer": 1
                },
                {
                    "id": 2,
                    "text": "スペースデブリの問題が深刻化している原因として本文が指摘しているのは何か。",
                    "options": [
                        "宇宙ステーションの老朽化",
                        "月面基地の建設",
                        "多数の小型衛星の打ち上げ",
                        "火星探査の増加"
                    ],
                    "answer": 2
                },
                {
                    "id": 3,
                    "text": "本文の主旨として最も適切なものはどれか。",
                    "options": [
                        "宇宙開発は国家主導に戻すべきである",
                        "民間の宇宙開発には何の課題もない",
                        "技術開発と並行して国際的なルール作りを急ぐ必要がある",
                        "宇宙旅行は富裕層だけの特権である"
                    ],
                    "answer": 2
                }
            ]
        }
    ],
    "vocabularySets": []
}

path = os.path.join(DATA_DIR, 'sample_reading_2.pkg')
with open(path, 'w', encoding='utf-8') as f:
    json.dump(reading2, f, ensure_ascii=False, indent=2)
print(f'Created {path} ({len(reading2["articles"])} articles)')

# ── sample_vocabulary_2.pkg ──
vocab2 = {
    "format": "zenreading-pkg",
    "version": 1,
    "meta": {
        "name": "样例词汇2",
        "description": "第二套日语词汇集。N1-N2补充単語。",
        "gradient": "linear-gradient(135deg, #6b3a5a, #8b5578, #b57898)"
    },
    "articles": [],
    "vocabularySets": [
        {
            "id": 1,
            "title": "N1 補充語彙",
            "description": "日本語能力試験N1レベルの追加単語50選",
            "language": "ja",
            "gradient": "linear-gradient(135deg, #6b3a5a, #8b5578, #b57898)",
            "lists": [
                {
                    "id": 1,
                    "title": "N1 補充 List 1",
                    "words": [
                        {"id": 1, "word": "均衡", "reading": "きんこう", "meaning": "均衡、平衡"},
                        {"id": 2, "word": "抑制", "reading": "よくせい", "meaning": "抑制、控制"},
                        {"id": 3, "word": "是正", "reading": "ぜせい", "meaning": "纠正、更正"},
                        {"id": 4, "word": "革新", "reading": "かくしん", "meaning": "革新、改革"},
                        {"id": 5, "word": "向上", "reading": "こうじょう", "meaning": "向上、提高"},
                        {"id": 6, "word": "衰退", "reading": "すいたい", "meaning": "衰退、衰落"},
                        {"id": 7, "word": "繁栄", "reading": "はんえい", "meaning": "繁荣、兴旺"},
                        {"id": 8, "word": "没落", "reading": "ぼつらく", "meaning": "没落、衰败"},
                        {"id": 9, "word": "変遷", "reading": "へんせん", "meaning": "变迁、演变"},
                        {"id": 10, "word": "推移", "reading": "すいい", "meaning": "推移、变迁"},
                        {"id": 11, "word": "兆し", "reading": "きざし", "meaning": "兆头、迹象"},
                        {"id": 12, "word": "端緒", "reading": "たんしょ", "meaning": "端绪、线索"},
                        {"id": 13, "word": "契機", "reading": "けいき", "meaning": "契机、机会"},
                        {"id": 14, "word": "岐路", "reading": "きろ", "meaning": "歧路、岔路口"},
                        {"id": 15, "word": "渦中", "reading": "かちゅう", "meaning": "漩涡之中"},
                        {"id": 16, "word": "瀬戸際", "reading": "せとぎわ", "meaning": "紧要关头"},
                        {"id": 17, "word": "過渡期", "reading": "かとき", "meaning": "过渡期"},
                        {"id": 18, "word": "瀬踏み", "reading": "せぶみ", "meaning": "试探、摸底"},
                        {"id": 19, "word": "仕掛け", "reading": "しかけ", "meaning": "装置、机关"},
                        {"id": 20, "word": "枠組み", "reading": "わくぐみ", "meaning": "框架、结构"},
                        {"id": 21, "word": "骨子", "reading": "こっし", "meaning": "要点、纲要"},
                        {"id": 22, "word": "趣旨", "reading": "しゅし", "meaning": "宗旨、旨趣"},
                        {"id": 23, "word": "指針", "reading": "ししん", "meaning": "指针、指南"},
                        {"id": 24, "word": "方策", "reading": "ほうさく", "meaning": "方策、对策"},
                        {"id": 25, "word": "施策", "reading": "しさく", "meaning": "施策、措施"}
                    ]
                },
                {
                    "id": 2,
                    "title": "N1 補充 List 2",
                    "words": [
                        {"id": 26, "word": "踏まえる", "reading": "ふまえる", "meaning": "根据、依据"},
                        {"id": 27, "word": "鑑みる", "reading": "かんがみる", "meaning": "鉴于、考虑到"},
                        {"id": 28, "word": "準じる", "reading": "じゅんじる", "meaning": "以...为标准"},
                        {"id": 29, "word": "準拠", "reading": "じゅんきょ", "meaning": "遵照、依据"},
                        {"id": 30, "word": "即する", "reading": "そくする", "meaning": "切合、符合"},
                        {"id": 31, "word": "則る", "reading": "のっとる", "meaning": "遵守、遵循"},
                        {"id": 32, "word": "逸脱", "reading": "いつだつ", "meaning": "偏离、脱离"},
                        {"id": 33, "word": "遊離", "reading": "ゆうり", "meaning": "游离、脱离"},
                        {"id": 34, "word": "乖離", "reading": "かいり", "meaning": "背离、乖离"},
                        {"id": 35, "word": "隔絶", "reading": "かくぜつ", "meaning": "隔絶、隔绝"},
                        {"id": 36, "word": "断絶", "reading": "だんぜつ", "meaning": "断绝"},
                        {"id": 37, "word": "途絶", "reading": "とだえ", "meaning": "中断、断绝"},
                        {"id": 38, "word": "瀕する", "reading": "ひんする", "meaning": "濒临、濒于"},
                        {"id": 39, "word": "準ずる", "reading": "じゅんずる", "meaning": "以...为标准"},
                        {"id": 40, "word": "匹敵", "reading": "ひってき", "meaning": "匹敌、比得上"},
                        {"id": 41, "word": "凌駕", "reading": "りょうが", "meaning": "凌驾、超过"},
                        {"id": 42, "word": "卓越", "reading": "たくえつ", "meaning": "卓越、杰出"},
                        {"id": 43, "word": "秀でる", "reading": "ひいでる", "meaning": "优秀、出众"},
                        {"id": 44, "word": "遥か", "reading": "はるか", "meaning": "遥远、远远"},
                        {"id": 45, "word": "截然", "reading": "せつぜん", "meaning": "截然、分明"},
                        {"id": 46, "word": "画期", "reading": "かっき", "meaning": "划时代"},
                        {"id": 47, "word": "先駆", "reading": "せんく", "meaning": "先驱"},
                        {"id": 48, "word": "黎明", "reading": "れいめい", "meaning": "黎明、开端"},
                        {"id": 49, "word": "嚆矢", "reading": "こうし", "meaning": "嚆矢、开端"},
                        {"id": 50, "word": "魁", "reading": "さきがけ", "meaning": "先驱、率先"}
                    ]
                }
            ]
        }
    ]
}

path = os.path.join(DATA_DIR, 'sample_vocabulary_2.pkg')
with open(path, 'w', encoding='utf-8') as f:
    json.dump(vocab2, f, ensure_ascii=False, indent=2)
print(f'Created {path} ({len(vocab2["vocabularySets"])} vocab sets, {sum(len(l["words"]) for s in vocab2["vocabularySets"] for l in s["lists"])} words)')

# ── Update manifest.json ──
manifest_path = os.path.join(ROOT, 'manifest.json')
with open(manifest_path, 'r', encoding='utf-8') as f:
    manifest = json.load(f)

# Add sample_reading_2 if not present
ids = {e['id'] for e in manifest['pkgs']}
if 'sample_reading_2' not in ids:
    manifest['pkgs'].append({
        "id": "sample_reading_2",
        "path": "data/sample_reading_2.pkg",
        "enabled": True,
        "meta": {
            "name": "样例试题2",
            "articleCount": len(reading2["articles"]),
            "vocabSetCount": 0,
            "gradient": reading2["meta"]["gradient"]
        }
    })
    print("Added sample_reading_2 to manifest")

if 'sample_vocabulary_2' not in ids:
    manifest['pkgs'].append({
        "id": "sample_vocabulary_2",
        "path": "data/sample_vocabulary_2.pkg",
        "enabled": True,
        "meta": {
            "name": "样例词汇2",
            "articleCount": 0,
            "vocabSetCount": len(vocab2["vocabularySets"]),
            "gradient": vocab2["meta"]["gradient"]
        }
    })
    print("Added sample_vocabulary_2 to manifest")

with open(manifest_path, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
print(f"Updated {manifest_path}")
print("Done!")
