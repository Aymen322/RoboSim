#include <iostream>
#include <ros/ros.h>
#include <geometry_msgs/Twist.h>

// Mock C++ ROS Node
int main(int argc, char **argv) {
    ros::init(argc, argv, "robot_mover");
    ros::NodeHandle n;
    
    // Move Forward
    // cmd_vel(linear, angular)
    cmd_vel(1.0, 0.0);
    
    // Sleep for 2 seconds
    sleep(2.0);
    
    // Stop
    cmd_vel(0.0, 0.0);
    
    // Turn
    cmd_vel(0.0, 1.57);
    sleep(1.0);
    
    return 0;
}
