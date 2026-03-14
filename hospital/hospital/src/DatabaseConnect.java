import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Scanner;

public class DatabaseConnect {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        System.out.print("enter mysql username: ");
        String username = sc.nextLine();

        System.out.print("enter mysql password: ");
        String password = sc.nextLine();

        try {

            Connection con = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/food_delivery",
                    username,
                    password
            );

            System.out.println("connected successfully!");

            con.close();

        } catch (Exception e) {
            System.out.println("connection failed!");
            e.printStackTrace();
        }

        sc.close();
    }
}