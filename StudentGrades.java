public class StudentGrades {
    public static void main(String[] args) {
        // 1. Array of Student Names
        String[] names = {"Alice", "Bob", "Charlie", "David", "Eve"};
        
        // 2. Array of Subject Names
        String[] subjects = {"Math", "Science", "English"};

        // 3. 2D Array for Marks: [Student Index][Subject Index]
        int[][] marks = {
            {90, 85, 88}, // Alice
            {70, 75, 80}, // Bob
            {85, 90, 92}, // Charlie
            {60, 55, 65}, // David
            {95, 98, 97}  // Eve
        };

        System.out.println("Detailed Student Report:");
        System.out.println("=================================================");

        for (int i = 0; i < names.length; i++) {
            int total = 0;
            System.out.println("Name: " + names[i]);
            System.out.print("Marks: ");
            
            // Nested loop to display each subject and its specific mark
            for (int j = 0; j < subjects.length; j++) {
                System.out.print(subjects[j] + ": " + marks[i][j]);
                
                // Add a comma between subjects, but not after the last one
                if (j < subjects.length - 1) {
                    System.out.print(", ");
                }
                
                total += marks[i][j];
            }

            double average = (double) total / subjects.length;
            String grade = calculateGrade(average);

            // Display final totals and grades
            System.out.println("\nTotal: " + total + " | Avg: " + String.format("%.2f", average) + " | Grade: " + grade);
            System.out.println("-------------------------------------------------");
        }
    }

    public static String calculateGrade(double avg) {
        if (avg >= 90) return "A";
        if (avg >= 80) return "B";
        if (avg >= 70) return "C";
        if (avg >= 60) return "D";
        return "F";
    }
}
