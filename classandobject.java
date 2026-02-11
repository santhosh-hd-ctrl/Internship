// 1. The Class (The Blueprint)
class Car {
    // Fields (Attributes/State)
    String brand;
    String color;
    int currentSpeed;

    // Constructor (Initializes the object)
    public Car(String brand, String color) {
        this.brand = brand;
        this.color = color;
        this.currentSpeed = 0; // Default speed
    }

    // Method (Behavior/Action)
    public void accelerate(int speedIncrease) {
        currentSpeed += speedIncrease;
        System.out.println(brand + " is accelerating. Speed: " + currentSpeed + " km/h");
    }

    // Method to display info
    public void showInfo() {
        System.out.println("Car Details: " + brand + " (" + color + ")");
    }
}

// 2. The Main Class (Where execution happens)
public class Main {
    public static void main(String[] args) {
        // Create Object 1
        Car myCar = new Car("Toyota", "Red");
        
        // Create Object 2
        Car yourCar = new Car("Tesla", "White");

        // Accessing methods of Object 1
        myCar.showInfo();      // Output: Car Details: Toyota (Red)
        myCar.accelerate(50);  // Output: Toyota is accelerating...

        System.out.println("-----------------");

        // Accessing methods of Object 2
        yourCar.showInfo();    // Output: Car Details: Tesla (White)
        yourCar.accelerate(90); // Output: Tesla is accelerating...
    }
}