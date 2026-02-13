import java.util.Scanner;

public class wallet {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        double balance = 10000;
        int choice;

        while (true) {
            System.out.println("\nBalance: ₹" + balance);
            System.out.println("1.UPI  2.Card  3.Cash  4.Exit");
            System.out.print("Choice: ");
            choice = sc.nextInt();

            if (choice == 4) break;

            System.out.print("Enter amount: ");
            double amount = sc.nextDouble();

            if (amount > 0 && amount <= balance) {
                balance -= amount;
                System.out.println("Payment Done ");
            } else {
                System.out.println("Transaction Failed ");
            }
        }

        System.out.println("Thank you!");
        sc.close();
    }
}
