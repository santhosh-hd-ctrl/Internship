import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class SimpleCalculatorAPP extends JFrame {

   
    private JTextField num1Field, num2Field;
    private JLabel resultLabel;

    public SimpleCalculatorAPP() {
        
        setTitle("Simple Calculator");
        setSize(300, 200);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new FlowLayout()); // Arranges items in a row

        
        num1Field = new JTextField(10); // Width of 10 columns
        num2Field = new JTextField(10);

        
        JButton addButton = new JButton("Add (+)");
        JButton subButton = new JButton("Subtract (-)");

        
        resultLabel = new JLabel("Result: ");

        
        add(new JLabel("Number 1:"));
        add(num1Field);
        add(new JLabel("Number 2:"));
        add(num2Field);
        add(addButton);
        add(subButton);
        add(resultLabel);

        
        addButton.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                calculate('+');
            }
        });

        subButton.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                calculate('-');
            }
        });
    }

    
    private void calculate(char op) {
        try {
            double n1 = Double.parseDouble(num1Field.getText());
            double n2 = Double.parseDouble(num2Field.getText());
            double res = 0;

            if (op == '+') res = n1 + n2;
            else if (op == '-') res = n1 - n2;

            resultLabel.setText("Result: " + res);
        } catch (NumberFormatException ex) {
            resultLabel.setText("Error: Enter valid numbers!");
        }
    }

    public static void main(String[] args) {
        
        SwingUtilities.invokeLater(() -> {
            new SimpleCalculatorAPP().setVisible(true);
        });
    }
}