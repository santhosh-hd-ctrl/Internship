public class Employee {
    @ValidateEmployee(
            regex = "^[A-Za-z ]{2,30}$",
            message = "Name must be 2-30 alphabetic characters."
    )
    private String name;

    @ValidateEmployee(
            regex = "^[A-Za-z0-0+_.-]+@(.+)$",
            message = "Invalid email format."
    )
    private String email;

    @ValidateEmployee(
            regex = "^\\d{10}$",
            message = "Phone number must be exactly 10 digits."
    )
    private String phone;

    public Employee(String name, String email, String phone) {
        this.name = name;
        this.email = email;
        this.phone = phone;
    }
}