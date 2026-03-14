import java.util.Scanner;

public class ElectricityBillCalculator {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.print("Enter the number of units consumed: ");
        int units = scanner.nextInt();
          double bill = calculateBill(units);
        
        System.out.printf("Total electricity bill for %d units: Rs. %.2f%n", units, bill);
        
        scanner.close();
    }
    
    public static double calculateBill(int units) {
        return (units <= 100) ? units * 5.0 :
               (units <= 200) ? 100 * 5.0 + (units - 100) * 7.0 :
               100 * 5.0 + 100 * 7.0 + (units - 200) * 10.0;
    

    }
}
