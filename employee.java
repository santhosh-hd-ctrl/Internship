class Employee {
    String name;
    double salary;

    void setDetails(String n, double s) {
        name = n;
        salary = s;
    }
}

class Manager extends Employee {
    double bonus;

    void setBonus(double b) {
        bonus = b;
    }

    void display() {
        System.out.println("Name: " + name);
        System.out.println("Bonus: " + bonus);
         System.out.println("Salary: " + salary);
         
        System.out.println("Total Salary: " + (salary + bonus));
    }
}

class Main {
    public static void main(String[] args) {
        Manager m = new Manager();
        m.setDetails("Santhosh H D", 30000);
        m.setBonus(5000);
        m.display();
    }
}