import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

public class ViewOrders {

    public static void viewOrders() {

        try {

            Connection con = DatabaseConnection.getConnection();

            String sql = "SELECT * FROM order_details";

            Statement stmt = con.createStatement();
            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {

                System.out.println(
                        "Order ID: " + rs.getInt("order_id") +
                                " | Date: " + rs.getTimestamp("order_date") +
                                " | Amount: " + rs.getDouble("total_amount") +
                                " | Customer ID: " + rs.getInt("customer_id") +
                                " | Delivery ID: " + rs.getInt("delivery_person_id")
                );
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}