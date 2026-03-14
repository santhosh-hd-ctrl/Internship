import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Scanner;

public class DatabaseConnection {

    public static Connection getConnection() {

        Connection con = null;

        try {
            Scanner sc = new Scanner(System.in);

            System.out.print("Enter MySQL Username: ");
            String username = sc.nextLine();

            System.out.print("Enter MySQL Password: ");
            String password = sc.nextLine();

            con = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/food_delivery",
                    username,
                    password
            );

            System.out.println("Connected to database!");

        } catch (Exception e) {
            e.printStackTrace();
        }

        return con;
    }
}