# Python Robotics Script
# This mocks a standard ROS node publishing velocity

def move_robot():
    # Accelerate forward
    # cmd_vel(linear_x, angular_z)
    cmd_vel(0.5, 0.0)
    sleep(1.0)
    
    cmd_vel(1.0, 0.0)
    sleep(2.0)
    
    # 90 degree turn
    cmd_vel(0.0, 1.57) 
    sleep(1.0)
    
    # Move forward again
    cmd_vel(1.0, 0.0)
    sleep(2.0)
    
    # Stop
    cmd_vel(0.0, 0.0)

if __name__ == "__main__":
    move_robot()
