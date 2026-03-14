public class Main {
    public static void main(String[] args) throws IllegalAccessException {
        // One valid entry, one invalid entry (email and phone)
        Employee emp = new Employee("John Doe", "john.doe@email", "12345");

        System.out.println("--- Starting Employee Validation ---");
        EmployeeValidator.validate(emp);
    }
}