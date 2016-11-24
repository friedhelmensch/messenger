contract messenger { 
    
    struct Message {
        address sender;
        string text;
    }
    
    struct Messages {
        uint32 counter;
        mapping (uint32 => Message) My_Messages;
    }
 
    mapping (address => Messages) All_Messages;
    event Message_sent(address _receiver);
  

// send first message to creator 
    
    function get_latest_message(address _receiver) constant returns (string) {
        uint32 counter= All_Messages[_receiver].counter;
        return All_Messages[_receiver].My_Messages[counter].text;
    }
    
    function get_message(address _receiver, uint32 index) constant returns (string) {
        return All_Messages[_receiver].My_Messages[index].text;
    }
    
    function get_counter(address _receiver) constant returns (uint32) {
        return All_Messages[_receiver].counter;
    }
    
    function messenger () {
        All_Messages[msg.sender].counter= 1;
        All_Messages[msg.sender].My_Messages[1].sender= msg.sender;  
        All_Messages[msg.sender].My_Messages[1].text= 'Hello World';
    }

    function send_message(address _receiver, string _text) returns (bool) {
        if (All_Messages[_receiver].counter > 0) 
            All_Messages[_receiver].counter++;
        else 
          All_Messages[_receiver].counter= 1;  
        
        uint32 counter= All_Messages[_receiver].counter;
        All_Messages[_receiver].My_Messages[counter].text= _text;
        All_Messages[_receiver].My_Messages[counter].sender= msg.sender;
        
        Message_sent(_receiver);
        return true;
    }
    
}

