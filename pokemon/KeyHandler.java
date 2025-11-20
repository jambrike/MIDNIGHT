/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

/**
 *
 * @author codespace
 */
public class KeyHandler implements java.awt.event.KeyListener {
    // track key states
    public boolean upPressed;
    public boolean downPressed;
    public boolean leftPressed;
    public boolean rightPressed;

    @Override
    public void keyTyped(java.awt.event.KeyEvent e) {
        
    }

    @Override
    public void keyPressed(java.awt.event.KeyEvent e) {
        int code = e.getKeyCode();
        if (code == java.awt.event.KeyEvent.VK_W) {
            upPressed = true;
        }
        if (code == java.awt.event.KeyEvent.VK_S) {
            downPressed = true;
        }
        if (code == java.awt.event.KeyEvent.VK_A) {
            leftPressed = true;
        }
        if (code == java.awt.event.KeyEvent.VK_D) {
            rightPressed = true;
        }
    }

    @Override
    public void keyReleased(java.awt.event.KeyEvent e) {
        int code = e.getKeyCode();
        if (code == java.awt.event.KeyEvent.VK_W) {
            upPressed = false;
        }
        if (code == java.awt.event.KeyEvent.VK_S) {
            downPressed = false;
        }
        if (code == java.awt.event.KeyEvent.VK_A) {
            leftPressed = false;
        }
        if (code == java.awt.event.KeyEvent.VK_D) {
            rightPressed = false;
        }
    }


}
