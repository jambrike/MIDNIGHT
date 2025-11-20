import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Graphics2D;
import javax.swing.JPanel;

public class gamepanel extends JPanel implements Runnable {

    final int originalTileSize = 16;
    final int scale = 3;
    final int tilesize = originalTileSize * scale;
    final int maxScreenCol = 16;
    final int maxscreenrow = 12;
    final int screenwidth = tilesize * maxScreenCol;
    final int screenheight = tilesize * maxscreenrow;

    final int FPS = 60;

   KeyHandler keyH = new KeyHandler();
    Thread gameThread;

    int playerx = 100;
    int playery = 100;
    int playerSpeed = 4;

    public gamepanel(){
        this.setPreferredSize(new Dimension(screenwidth, screenheight));
        this.setBackground(Color.BLACK);
        this.setDoubleBuffered(true);
        this.addKeyListener(keyH);
        this.setFocusable(true);
    }

    public void startgameThread(){
        gameThread = new Thread(this);
        gameThread.start();
    }

    @Override
    public void run(){
        while(gameThread != null){
            double drawInterval = 1000000000 / FPS;
            double nextDrawTime = System.nanoTime() + drawInterval;
            long currentTime = System.nanoTime() + drawInterval
            
            update();

            repaint();

            try{
                double remainingTime = nextDrawTime - System.nanoTime();
                remainingTime = remainingTime / 1000000;
                if(remainingTime < 0){
                    remainingTime = 0;
                }
                Thread.sleep((long) remainingTime);

                nextDrawTime += drawInterval;
                

            } catch (InterruptedException e){
                e.printStackTrace();
        }
    public void update(){
        if(keyH.upPressed == true){
            playery -= playerSpeed;
        }
        if(keyH.downPressed == true){
            playery += playerSpeed;
        }
        if(keyH.leftPressed == true){
            playerx -= playerSpeed;
        }
        if(keyH.rightPressed == true){
            playerx += playerSpeed;
            
        }

    }
    public void paintcomponent(Graphics g){
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g;
        g2.setColor(Color.WHITE);
        g2.fillRect(100, 100, tilesize, tilesize);
        g2.dispose();
    }    

    public void setPlayery(int playery) {
        this.playery = playery;
    }
)    
    }
}
