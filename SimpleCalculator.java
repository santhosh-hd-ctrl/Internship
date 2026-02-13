import java.util.Scanner;

public class SimpleCalculator {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        
        System.out.print("Enter first number: ");
        double num1 = sc.nextDouble();

        System.out.print("Enter second number: ");
        double num2 = sc.nextDouble();

        
        System.out.println("Choose Operation: 1. Add (+)  2. Subtract (-)");
        int choice = sc.nextInt();

        double result = 0;

        
        if (choice == 1) {
            result = num1 + num2;
            System.out.println("Result: " + result);
        } else if (choice == 2) {
            result = num1 - num2;
            System.out.println("Result: " + result);
        } else {
            System.out.println("Invalid choice!");
        }

        sc.close();
    }
}