from app.db.supabase import get_supabase
from app.schemas.shop import ShopItemCreate
from app.crud.crud_shop import shop_item

def seed():
    db = get_supabase()
    
    items = [
        ShopItemCreate(
            title="Ad-Free Pass",
            description="Remove all ads from the arcade for 30 days.",
            cost=500,
            category="Feature",
            image_url="https://img.icons8.com/fluency/96/no-ads.png"
        ),
        ShopItemCreate(
            title="Premium Game Key",
            description="Unlock a random premium game for your library.",
            cost=1000,
            category="Game",
            image_url="https://img.icons8.com/fluency/96/key.png"
        ),
        ShopItemCreate(
            title="Extra Spin Ticket",
            description="Get 1 immediate extra spin on the Daily Wheel.",
            cost=50,
            category="Utility",
            image_url="https://img.icons8.com/fluency/96/ticket.png"
        ),
        ShopItemCreate(
            title="Raffle Multiplier",
            description="Your next raffle entry counts as double.",
            cost=200,
            category="Boost",
            image_url="https://img.icons8.com/fluency/96/star.png"
        )
    ]
    
    for item_in in items:
        try:
            # Check if item already exists
            existing = db.table("arcade_shop_items").select("*").eq("title", item_in.title).execute()
            if not existing.data:
                shop_item.create(db, obj_in=item_in)
                print(f"Created shop item: {item_in.title}")
            else:
                print(f"Shop item already exists: {item_in.title}")
        except Exception as e:
            print(f"Error creating item {item_in.title}: {e}")

if __name__ == "__main__":
    seed()
