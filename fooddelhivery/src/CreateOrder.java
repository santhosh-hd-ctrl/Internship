import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.Scanner;

public class CreateOrder {

    public static void createOrder() {

        try {

            Connection con = DatabaseConnection.getConnection();
            Scanner sc = new Scanner(System.in);

            String sql = "INSERT INTO order_details (order_date, total_amount, customer_id, delivery_person_id) VALUES (NOW(), ?, ?, ?)";

            PreparedStatement ps = con.prepareStatement(sql);

            System.out.print("Enter Total Amount: ");
            double amount = sc.nextDouble();

            System.out.print("Enter Customer ID: ");
            int customerId = sc.nextInt();

            System.out.print("Enter Delivery Person ID: ");
            int deliveryId = sc.nextInt();

            ps.setDouble(1, amount);
            ps.setInt(2, customerId);
            ps.setInt(3, deliveryId);

            ps.executeUpdate();

            System.out.println("Order inserted successfully!");

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}