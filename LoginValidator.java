import java.util.Scanner;

public class LoginValidator {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String username = "admin", password = "1234";
        int attempts = 0;
        final int MAX_ATTEMPTS = 3;
        
        while (attempts < MAX_ATTEMPTS) {
            System.out.print("Enter username: ");
            String inputUser = sc.nextLine();
            System.out.print("Enter password: ");
            String inputPass = sc.nextLine();
            
            if (inputUser.equals(username) && inputPass.equals(password)) {
                System.out.println("Login Successful! Welcome Admin.");
                return;
            } else {
                attempts++;
                if (attempts < MAX_ATTEMPTS) {
                    System.out.println("Invalid credentials! Attempts remaining: " + (MAX_ATTEMPTS - attempts));
                }
            }
        }
        System.out.println("Account blocked! Too many failed attempts.");
        sc.close();
    }
}

