/*
v 0.3.5
*/
contract owned {
    address owner;

    function owned() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        if (msg.sender != owner) throw;
        _
    }

    function kill() { 
        if (msg.sender == owner) suicide(owner); 
    }
}

contract mapper is owned { 
    
    uint32 counter;
    uint256 private value;
    uint256 private price;
    mapping (address => address) members;
    event CreateMember(address new_address);

    function mapper () {
        counter = 0;
        value= 0;
        price= 490000000000000000;
    }
    
    
    function () {
        if ( msg.value > price && check_Address(msg.sender) == false ) { 
        create_Member(msg.sender);
        value+= msg.value;
        } else throw;
    }

    function create_Member (address new_address) returns (bool)  {
        members[msg.sender]= new_address;
        counter++;
        CreateMember(new_address);
        return true;
    }
    
    function send_Ether_To_Owner() onlyOwner returns (bool) {                       
        value= 0;
        return owner.send(this.balance);
   }
    
    function get_Counter () constant returns (uint32) {
     return counter;   
    }
    
    function get_Value () constant returns (uint256) {
     return value;   
    }
    
    function check_Address (address a) constant returns (bool) {
     if (members[a] == a) return true; else return false;   
    }
    
}

