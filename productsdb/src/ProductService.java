import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import org.bson.Document;

import static com.mongodb.client.model.Filters.*;
import static com.mongodb.client.model.Sorts.*;

public class ProductService {

    MongoDatabase db = MongoDBConnection.getDatabase();
    MongoCollection<Document> collection = db.getCollection("products");

    // 1️⃣ Price > 500
    public void priceGreaterThan500() {
        System.out.println("\nProducts with price > 500");
        for (Document doc : collection.find(gt("product_price", 500))) {
            System.out.println(doc.toJson());
        }
    }

    // 2️⃣ Find color indigo
    public void findColorIndigo() {
        System.out.println("\nProducts with color indigo");
        for (Document doc : collection.find(eq("product_color", "indigo"))) {
            System.out.println(doc.toJson());
        }
    }

    // 3️⃣ Count by material Soft
    public void countMaterialSoft() {
        long count = collection.countDocuments(eq("product_material", "Soft"));
        System.out.println("\nCount of products with material Soft: " + count);
    }

    // 4️⃣ Sort ascending
    public void sortAscending() {
        System.out.println("\nProducts sorted by price ASC");
        for (Document doc : collection.find().sort(ascending("product_price"))) {
            System.out.println(doc.toJson());
        }
    }

    // 5️⃣ Sort descending
    public void sortDescending() {
        System.out.println("\nProducts sorted by price DESC");
        for (Document doc : collection.find().sort(descending("product_price"))) {
            System.out.println(doc.toJson());
        }
    }

    // 6️⃣ Maximum price
    public void maxPrice() {

        Document doc = collection.find().sort(descending("product_price")).first();

        System.out.println("Product with Maximum Price:");

        if (doc != null) {
            System.out.println(doc.toJson());
        } else {
            System.out.println("No data found in collection.");
        }
    }
    // 7️⃣ Minimum price
    public void minPrice() {

        Document doc = collection.find().sort(ascending("product_price")).first();

        System.out.println("Product with Minimum Price:");

        if (doc != null) {
            System.out.println(doc.toJson());
        } else {
            System.out.println("No data found in collection.");
        }
    }

    // 8️⃣ Average price
    public void averagePrice() {

        double total = 0;
        int count = 0;

        for (Document doc : collection.find()) {
            total += doc.getDouble("product_price");
            count++;
        }

        double avg = total / count;

        System.out.println("\nAverage Product Price: " + avg);
    }

    // 9️⃣ Price between range
    public void priceBetween() {
        System.out.println("\nProducts with price between 400 and 800");

        for (Document doc : collection.find(
                Filters.and(gt("product_price", 400), lt("product_price", 800)))) {
            System.out.println(doc.toJson());
        }
    }
}