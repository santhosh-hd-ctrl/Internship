import java.sql.*;
import java.util.Scanner;

public class hospital {

    static final String URL = "jdbc:mysql://localhost:3306/hospital";
    static final String DB_USER = "root";
    static final String DB_PASSWORD = "your_mysql_password";

    static Scanner sc = new Scanner(System.in);

    public static void main(String[] args) {

        System.out.println("===== Hospital Login =====");
        System.out.print("Enter Username: ");
        String username = sc.nextLine();

        System.out.print("Enter Password: ");
        String password = sc.nextLine();

        try {
            Connection con = DriverManager.getConnection(URL, DB_USER, DB_PASSWORD);

            String query = "SELECT * FROM users WHERE username=? AND password=?";
            PreparedStatement ps = con.prepareStatement(query);
            ps.setString(1, username);
            ps.setString(2, password);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                System.out.println("\nLogin Successful!\n");
                menu(con);
            } else {
                System.out.println("Invalid Username or Password!");
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // ===== MENU =====
    public static void menu(Connection con) throws SQLException {

        int choice;

        do {
            System.out.println("\n===== MENU =====");
            System.out.println("1. View All Appointments");
            System.out.println("2. Add Appointment");
            System.out.println("3. View Appointments by Doctor");
            System.out.println("4. Exit");
            System.out.print("Enter choice: ");
            choice = sc.nextInt();

            switch (choice) {
                case 1:
                    viewAppointments(con);
                    break;
                case 2:
                    addAppointment(con);
                    break;
                case 3:
                    viewByDoctor(con);
                    break;
                case 4:
                    System.out.println("Exiting...");
                    break;
                default:
                    System.out.println("Invalid choice!");
            }

        } while (choice != 4);
    }

    // ===== VIEW ALL =====
    public static void viewAppointments(Connection con) throws SQLException {

        Statement stmt = con.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT * FROM Appointment");

        while (rs.next()) {
            System.out.println(
                    "ID: " + rs.getInt("appointment_id") +
                            ", Date: " + rs.getDate("appointment_date") +
                            ", Time: " + rs.getTime("appointment_time") +
                            ", Patient ID: " + rs.getInt("patient_id") +
                            ", Doctor ID: " + rs.getInt("doctor_id")
            );
        }
    }

    // ===== ADD APPOINTMENT =====
    public static void addAppointment(Connection con) throws SQLException {

        sc.nextLine(); // clear buffer

        System.out.print("Enter Appointment Date (YYYY-MM-DD): ");
        String date = sc.nextLine();

        System.out.print("Enter Appointment Time (HH:MM:SS): ");
        String time = sc.nextLine();

        System.out.print("Enter Patient ID: ");
        int patientId = sc.nextInt();

        System.out.print("Enter Doctor ID: ");
        int doctorId = sc.nextInt();

        String query = "INSERT INTO Appointment (appointment_date, appointment_time, patient_id, doctor_id) VALUES (?, ?, ?, ?)";

        PreparedStatement ps = con.prepareStatement(query);
        ps.setString(1, date);
        ps.setString(2, time);
        ps.setInt(3, patientId);
        ps.setInt(4, doctorId);

        ps.executeUpdate();

        System.out.println("Appointment Added Successfully!");
    }

    // ===== VIEW BY DOCTOR =====
    public static void viewByDoctor(Connection con) throws SQLException {

        System.out.print("Enter Doctor ID: ");
        int doctorId = sc.nextInt();

        String query = "SELECT * FROM Appointment WHERE doctor_id=?";
        PreparedStatement ps = con.prepareStatement(query);
        ps.setInt(1, doctorId);

        ResultSet rs = ps.executeQuery();

        while (rs.next()) {
            System.out.println(
                    "ID: " + rs.getInt("appointment_id") +
                            ", Date: " + rs.getDate("appointment_date") +
                            ", Time: " + rs.getTime("appointment_time") +
                            ", Patient ID: " + rs.getInt("patient_id")
            );
        }
    }
}