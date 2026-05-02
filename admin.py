import json
import os
import uuid
from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse

app = FastAPI()

JSON_PATH = os.path.join(os.path.dirname(__file__), "src", "wishlist.json")

def load_data():
    if os.path.exists(JSON_PATH):
        with open(JSON_PATH, "r") as f:
            data = json.load(f)
            updated = False
            for item in data:
                if "id" not in item:
                    item["id"] = str(uuid.uuid4())
                    updated = True
                if "completed" not in item:
                    item["completed"] = False
                    updated = True
            if updated:
                save_data(data)
            return data
    return []

def save_data(data):
    with open(JSON_PATH, "w") as f:
        json.dump(data, f, indent=2)

@app.get("/", response_class=HTMLResponse)
def get_admin_page():
    items = load_data()
    rows = ""
    for item in items:
        status_class = "completed" if item.get("completed") else ""
        rows += f"""
        <div class='item-preview {status_class}' id='item-{item['id']}'>
            <img src='{item['img']}' />
            <div class='item-info'>
                <span class='item-name'>{item['name']}</span>
                <span class='item-price'>{item['price']}</span>
            </div>
            <div class='item-actions'>
                <form action='/toggle/{item['id']}' method='post' style='margin:0'>
                    <button type='submit' class='action-btn toggle-btn' title='Toggle Status'>
                        <div class='custom-checkbox'>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                    </button>
                </form>
                <button type='button' class='action-btn delete-btn' onclick="showDeleteModal('{item['id']}', '{item['name']}')" title='Delete'>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
            </div>
        </div>"""
    
    return f"""
    <html>
        <head>
            <title>cracked editor</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
                :root {{
                    --bg: #000000;
                    --card: #0a0a0a;
                    --fg: #ffffff;
                    --dim: #666666;
                    --border: #1a1a1a;
                    --red: #ff3b30;
                    --blue: #007aff;
                }}
                * {{ box-sizing: border-box; -webkit-font-smoothing: antialiased; }}
                body {{ 
                    font-family: 'Inter', -apple-system, sans-serif; 
                    max-width: 480px; 
                    margin: 80px auto; 
                    padding: 24px; 
                    background: var(--bg); 
                    color: var(--fg);
                    line-height: 1.5;
                }}
                h2 {{ font-size: 20px; font-weight: 600; letter-spacing: -0.03em; margin-bottom: 24px; }}
                
                .form-section {{ margin-bottom: 48px; }}
                input {{ 
                    width: 100%; 
                    padding: 14px 16px; 
                    margin-bottom: 12px; 
                    border-radius: 12px; 
                    border: 1px solid var(--border); 
                    background: var(--card); 
                    color: white; 
                    font-size: 14px;
                    transition: all 0.2s;
                }}
                input:focus {{ outline: none; border-color: #333; background: #111; }}
                
                .add-btn {{ 
                    width: 100%; 
                    padding: 14px; 
                    background: #fff; 
                    color: #000; 
                    border: none; 
                    border-radius: 12px; 
                    font-weight: 600; 
                    font-size: 14px;
                    cursor: pointer; 
                    transition: all 0.2s;
                    margin-top: 8px;
                }}
                .add-btn:hover {{ opacity: 0.9; transform: translateY(-1px); }}
                .add-btn:active {{ transform: translateY(0); }}
                
                .items-section h3 {{ font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--dim); margin-bottom: 16px; }}
                .item-preview {{ 
                    display: flex; 
                    align-items: center; 
                    gap: 14px; 
                    padding: 16px 0; 
                    border-bottom: 1px solid var(--border);
                    transition: opacity 0.3s ease;
                }}
                
                .item-preview img {{ width: 40px; height: 40px; border-radius: 8px; object-fit: cover; background: #111; border: 1px solid var(--border); }}
                .item-info {{ flex: 1; display: flex; flex-direction: column; gap: 2px; }}
                .item-name {{ font-size: 14px; font-weight: 500; }}
                .item-price {{ font-size: 13px; color: var(--dim); }}
                
                .item-actions {{ display: flex; gap: 8px; }}
                .action-btn {{ 
                    background: transparent; 
                    border: none;
                    color: var(--dim); 
                    width: 32px; 
                    height: 32px; 
                    border-radius: 8px; 
                    cursor: pointer; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    transition: all 0.2s;
                }}
                .delete-btn:hover {{ color: var(--red); background: rgba(255, 59, 48, 0.1); }}

                /* Premium Checkbox */
                .custom-checkbox {{
                    width: 20px;
                    height: 20px;
                    border: 2px solid #333;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }}
                .custom-checkbox svg {{
                    width: 12px;
                    height: 12px;
                    color: #000;
                    opacity: 0;
                    transform: scale(0.5);
                    transition: all 0.2s ease;
                }}
                .item-preview.completed {{ opacity: 0.5; }}
                .item-preview.completed .item-name {{ text-decoration: line-through; }}
                .item-preview.completed .custom-checkbox {{
                    background: #fff;
                    border-color: #fff;
                }}
                .item-preview.completed .custom-checkbox svg {{
                    opacity: 1;
                    transform: scale(1);
                }}

                /* macOS Style Modal */
                #modal-overlay {{
                    display: none;
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.4);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    z-index: 1000;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.2s ease;
                }}
                .modal-card {{
                    background: #1c1c1e;
                    border: 0.5px solid rgba(255,255,255,0.1);
                    border-radius: 14px;
                    width: 280px;
                    padding: 20px;
                    text-align: center;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                    animation: slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
                }}
                @keyframes fadeIn {{ from {{ opacity: 0; }} to {{ opacity: 1; }} }}
                @keyframes slideUp {{ from {{ transform: translateY(10px) scale(0.95); opacity: 0; }} to {{ transform: translateY(0) scale(1); opacity: 1; }} }}
                
                .modal-card h4 {{ margin: 0 0 4px 0; font-size: 17px; font-weight: 600; color: #fff; }}
                .modal-card p {{ margin: 0 0 20px 0; font-size: 13px; color: #8e8e93; }}
                
                .modal-actions {{ display: flex; flex-direction: column; gap: 8px; }}
                .modal-btn {{ 
                    width: 100%; 
                    padding: 10px; 
                    border-radius: 8px; 
                    font-size: 15px; 
                    font-weight: 500; 
                    cursor: pointer; 
                    border: none;
                    transition: background 0.2s;
                }}
                .confirm-btn {{ background: var(--red); color: #fff; font-weight: 600; }}
                .cancel-btn {{ background: rgba(255,255,255,0.05); color: #0a84ff; }}
                .cancel-btn:hover {{ background: rgba(255,255,255,0.1); }}
            </style>
        </head>
        <body>
            <div id="modal-overlay" onclick="hideDeleteModal(event)">
                <div class="modal-card" onclick="event.stopPropagation()">
                    <h4>Delete Item?</h4>
                    <p id="modal-item-name"></p>
                    <div class="modal-actions">
                        <form id="delete-form" method="post">
                            <button type="submit" class="modal-btn confirm-btn">Delete</button>
                        </form>
                        <button class="modal-btn cancel-btn" onclick="hideDeleteModal()">Cancel</button>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h2>Add Item</h2>
                <form action="/add" method="post">
                    <input name="name" placeholder="Item Name" required />
                    <input name="price" placeholder="Price" required />
                    <input name="link" placeholder="Link URL" required />
                    <input name="img" placeholder="Image URL" required />
                    <button type="submit" class="add-btn">Add to wishlist.json</button>
                </form>
            </div>
            
            <div class="items-section">
                <h3>Live Preview</h3>
                <div class="item-list">{rows}</div>
            </div>

            <script>
                function showDeleteModal(id, name) {{
                    document.getElementById('modal-item-name').innerText = name;
                    document.getElementById('delete-form').action = '/delete/' + id;
                    document.getElementById('modal-overlay').style.display = 'flex';
                }}
                function hideDeleteModal(e) {{
                    document.getElementById('modal-overlay').style.display = 'none';
                }}
            </script>
        </body>
    </html>
    """

@app.post("/add")
def add_item(name: str = Form(...), price: str = Form(...), link: str = Form(...), img: str = Form(...)):
    data = load_data()
    data.append({
        "id": str(uuid.uuid4()),
        "name": name,
        "price": price,
        "link": link,
        "img": img,
        "completed": False
    })
    save_data(data)
    return HTMLResponse("<script>window.location.href='/';</script>")

@app.post("/toggle/{item_id}")
def toggle_item(item_id: str):
    data = load_data()
    for item in data:
        if item.get("id") == item_id:
            item["completed"] = not item.get("completed", False)
            break
    save_data(data)
    return HTMLResponse("<script>window.location.href='/';</script>")

@app.post("/delete/{item_id}")
def delete_item(item_id: str):
    data = load_data()
    data = [item for item in data if item.get("id") != item_id]
    save_data(data)
    return HTMLResponse("<script>window.location.href='/';</script>")

if __name__ == "__main__":
    import uvicorn
    print("Starting local admin at http://localhost:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
