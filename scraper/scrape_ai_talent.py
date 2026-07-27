"""
AI人才数据爬取脚本
从 GitHub API 和 arXiv API 获取 AI 领域人才公开信息
用于种子数据填充

用法: python scraper/scrape_ai_talent.py
输出: scraper/output/ 目录下的 JSON 文件
"""

import json
import os
import time
import sys
from urllib.request import urlopen, Request
from urllib.error import HTTPError

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def fetch_json(url, headers=None):
    """Fetch JSON from URL"""
    req = Request(url, headers=headers or {
        "User-Agent": "AI-Resume-Platform/1.0",
        "Accept": "application/vnd.github.v3+json",
    })
    try:
        with urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except HTTPError as e:
        print(f"  HTTP {e.code}: {url}")
        return None
    except Exception as e:
        print(f"  Error: {e}")
        return None


def scrape_github_ai_contributors():
    """Scrape GitHub users who contribute to AI/ML repos"""
    print("\n=== Scraping GitHub AI Contributors ===")

    # Search for users with AI/ML in bio
    queries = [
        "machine learning engineer location:China",
        "AI engineer location:China",
        "deep learning researcher",
        "NLP engineer",
        "computer vision engineer",
    ]

    all_users = []
    seen_logins = set()

    for query in queries:
        print(f"Searching: {query}")
        data = fetch_json(
            f"https://api.github.com/search/users?q={query.replace(' ', '+')}&per_page=30&sort=followers"
        )

        if data and "items" in data:
            for item in data["items"]:
                login = item.get("login", "")
                if login and login not in seen_logins:
                    seen_logins.add(login)
                    # Get user details
                    time.sleep(0.1)
                    user_data = fetch_json(f"https://api.github.com/users/{login}")
                    if user_data:
                        all_users.append({
                            "name": user_data.get("name") or login,
                            "login": login,
                            "bio": user_data.get("bio") or "",
                            "company": user_data.get("company") or "",
                            "location": user_data.get("location") or "",
                            "blog": user_data.get("blog") or "",
                            "email": user_data.get("email") or "",
                            "public_repos": user_data.get("public_repos", 0),
                            "followers": user_data.get("followers", 0),
                            "avatar_url": user_data.get("avatar_url", ""),
                            "source": "github",
                            "skills": infer_skills_from_bio(user_data.get("bio") or ""),
                        })
        time.sleep(0.5)  # Rate limiting

    print(f"  Found {len(all_users)} unique users")

    # Save results
    output_path = os.path.join(OUTPUT_DIR, "github_users.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_users, f, ensure_ascii=False, indent=2)
    print(f"  Saved to {output_path}")

    return all_users


def scrape_arxiv_authors():
    """Scrape recent AI/ML paper authors from arXiv"""
    print("\n=== Scraping arXiv AI Paper Authors ===")

    categories = ["cs.AI", "cs.LG", "cs.CL", "cs.CV"]
    all_authors = []
    seen_names = set()

    for cat in categories:
        print(f"Fetching {cat} recent papers...")
        data = fetch_json(
            f"http://export.arxiv.org/api/query?search_query=cat:{cat}"
            f"&start=0&max_results=50&sortBy=submittedDate&sortOrder=descending"
        )

        if data:
            entries = data.get("feed", {}).get("entry", [])
            if isinstance(entries, dict):
                entries = [entries]

            for entry in entries:
                authors = entry.get("author", [])
                if isinstance(authors, dict):
                    authors = [authors]

                for author in authors:
                    name = author.get("name", "")
                    if name and name not in seen_names:
                        seen_names.add(name)
                        all_authors.append({
                            "name": name,
                            "source": "arxiv",
                            "affiliation": "",
                            "skills": ["AI Research", cat.replace("cs.", "")],
                        })

        time.sleep(3)  # arXiv rate limiting

    print(f"  Found {len(all_authors)} unique authors")

    output_path = os.path.join(OUTPUT_DIR, "arxiv_authors.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_authors, f, ensure_ascii=False, indent=2)
    print(f"  Saved to {output_path}")

    return all_authors


def infer_skills_from_bio(bio):
    """Extract skills from bio text"""
    bio_lower = bio.lower()
    skill_keywords = {
        "Python": ["python"],
        "Machine Learning": ["machine learning", "ml"],
        "Deep Learning": ["deep learning", "dl"],
        "NLP": ["nlp", "natural language"],
        "Computer Vision": ["computer vision", "cv", "image"],
        "TensorFlow": ["tensorflow", "tf"],
        "PyTorch": ["pytorch"],
        "LLM": ["llm", "large language model", "gpt"],
        "Data Science": ["data science", "data scientist"],
        "Reinforcement Learning": ["reinforcement learning", "rl"],
        "Kubernetes": ["kubernetes", "k8s"],
        "Docker": ["docker", "container"],
        "AWS": ["aws", "amazon web"],
        "Cloud Computing": ["cloud"],
        "SQL": ["sql", "database"],
        "Go": [" go ", "golang"],
        "Java": [" java"],
        "Rust": ["rust"],
        "React": ["react"],
        "Spark": ["spark", "pyspark"],
        "CUDA": ["cuda"],
    }
    skills = []
    for skill, keywords in skill_keywords.items():
        if any(kw in bio_lower for kw in keywords):
            skills.append(skill)
    return skills


def generate_seed_profiles(github_users, arxiv_authors):
    """Generate seed profiles for the database"""
    print("\n=== Generating Seed Profiles ===")

    profiles = []

    # From GitHub
    for user in github_users:
        if user.get("name"):
            profile = {
                "name": user["name"],
                "phone": "",
                "bio": user.get("bio", "")[:200] if user.get("bio") else "",
                "company": user.get("company", "")[:50] if user.get("company") else "",
                "position": infer_position(user.get("bio", "")),
                "skills": user.get("skills", [])[:5],
                "source": "github",
                "avatar_url": user.get("avatar_url", ""),
                "location": user.get("location", ""),
            }
            profiles.append(profile)

    # From arXiv
    for author in arxiv_authors:
        if not any(p["name"] == author["name"] for p in profiles):
            profile = {
                "name": author["name"][:50],
                "phone": "",
                "bio": f"AI Researcher in {', '.join(author.get('skills', []))}",
                "company": author.get("affiliation", ""),
                "position": "AI Researcher",
                "skills": author.get("skills", [])[:5],
                "source": "arxiv",
                "avatar_url": "",
                "location": "",
            }
            profiles.append(profile)

    print(f"  Generated {len(profiles)} seed profiles")

    output_path = os.path.join(OUTPUT_DIR, "seed_profiles.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(profiles, f, ensure_ascii=False, indent=2)
    print(f"  Saved to {output_path}")

    return profiles


def infer_position(bio):
    """Infer position from bio"""
    bio_lower = bio.lower()
    if "engineer" in bio_lower:
        if "senior" in bio_lower or "staff" in bio_lower:
            return "Senior Engineer"
        return "Engineer"
    if "researcher" in bio_lower or "research" in bio_lower:
        if "senior" in bio_lower:
            return "Senior Researcher"
        return "Researcher"
    if "scientist" in bio_lower:
        return "Data Scientist"
    if "manager" in bio_lower:
        return "Engineering Manager"
    if "founder" in bio_lower or "cto" in bio_lower:
        return "Founder/CTO"
    return "AI Professional"


def main():
    print("=" * 50)
    print("AI Talent Data Scraper")
    print("=" * 50)

    github_users = scrape_github_ai_contributors()
    time.sleep(1)

    arxiv_authors = scrape_arxiv_authors()
    time.sleep(1)

    seed_profiles = generate_seed_profiles(github_users, arxiv_authors)

    print("\n" + "=" * 50)
    print(f"Done! Generated {len(seed_profiles)} seed profiles")
    print(f"Output directory: {OUTPUT_DIR}")
    print("=" * 50)


if __name__ == "__main__":
    main()
