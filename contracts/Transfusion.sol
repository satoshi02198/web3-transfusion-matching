// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;
import "hardhat/console.sol";

contract Transfusion {

   enum State {
    None, // default state 0
    Registered, // 1
    Deleted, // 2
    Matched // 3
   }

    struct Donor {
        uint id;
        address addr;
        string name;
        string bloodType;
        State state;
    }

    struct Recipient {
        uint id;
        address addr;
        string name;
        string bloodType;
        State state;
    }

    address public contractOwner;

    mapping(address => bool) public admins;

    mapping(address => Donor) private donors;
    mapping(address => Recipient) private recipients;

    uint[] public donorsId;
    uint[] public recipientId;

    address[] public donorAddresses;
    address[] public recipientAddresses;

    uint public donorsNumber;
    uint public recipientsNumber;

    event RegisteredDonor(uint256 indexed id,address indexed donor);
    event RegisteredRecipient(uint256 indexed id,address indexed recipient);
    event Matched(address indexed donor, address indexed recipient, string indexed bloodType);

    constructor(){
        admins[msg.sender] = true;
        contractOwner = msg.sender;
    }

    

    modifier onlyAdmins(){
       require(admins[msg.sender] == true, "Only admin can call");
        _;
        
    }
    modifier onlyOwner(){
        require(msg.sender == contractOwner, 'Only owner can call');
        _;
    }



    // get contract owner address
    function getOwner() public view returns(address){
        return contractOwner;
    }

    // set the admin address
    function setAdmins(address newAdmin) public onlyOwner {
     admins[newAdmin] = true;
    }

    // get the admins address
    function checkAdmins(address _address) public view returns(bool){
        return admins[_address];
    }

    // get the donors id[]
    function getDonorsId() public view returns(uint[] memory  _donorsId) {
        return donorsId;
    }
    // get the recipients id[]
    function getRecipientId() public view returns(uint[] memory  _recipientId) {
        return recipientId;
    }

    // get the donors addresses[]
    function getDonorAddresses() public view returns(address[] memory _donorAddresses) {
        return donorAddresses;
    }
    // get the recipients addresses[]
    function getRecipientAddresses() public view returns(address[] memory _RecipientAddresses) {
        return recipientAddresses;
    }

    // get number of donors => uint
    function getDonorsNumber()public view returns(uint _donorsNumber) {
        return donorsNumber;
    }
    // get number of recipient => uint
    function getRecipientsNumber()public view returns(uint _recipientsNumber) {
        return recipientsNumber;
    }
    

    

    // to get Donor's info
    function getDonor(address _donorAddress) public view onlyAdmins returns(uint id, string memory name, string memory bloodType, State state) {
        require(donors[_donorAddress].state != State.None, "Donor: not registered"); 

        return (donors[_donorAddress].id,donors[_donorAddress].name, donors[_donorAddress].bloodType, donors[_donorAddress].state);
    }
    // to get Recipient's info
    function getRecipient(address _recipientAddress) public view onlyAdmins returns(uint id, string memory name, string memory bloodType, State state) {
        require(recipients[_recipientAddress].state != State.None, "Recipient: not registered"); 

        return(recipients[_recipientAddress].id,recipients[_recipientAddress].name, recipients[_recipientAddress].bloodType, recipients[_recipientAddress].state);
    }  

    // to get Donor's state for donor
    function getDonorState(address _donorAddress) public view returns(State state){
        // require(_donorAddress == msg.sender, 'can not get another donor state');
        return donors[_donorAddress].state;
    }

    // to get Recipient's state for recipient
    function getRecipientState(address _recipientAddress) public view returns(State state){
        // require(_recipientAddress == msg.sender, 'can not get another recipient state');
        return recipients[_recipientAddress].state;
    }



    // to register donor
    function registerDonor(string memory _name, string memory _bloodType)public{
        require(donors[msg.sender].state == State.None, "Donor: already registered");
        
        donorsNumber ++;

        // mapping the address to Donor
        donors[msg.sender] = Donor({
            id: donorsNumber,
            addr: msg.sender,
            name: _name,
            bloodType: _bloodType,
            state: State.Registered
        });

        donorsId.push(donorsNumber);
        donorAddresses.push(msg.sender);

        // try to match depends on bloodType
        attemptMatchForDonor(msg.sender,_bloodType);

        // emit event donor's address
        emit RegisteredDonor(donorsNumber ,msg.sender);

    }

    // to register recipient
    function registerRecipient(string memory _name, string memory _bloodType) public {
        require(recipients[msg.sender].state == State.None,"Recipient: already registered");

        recipientsNumber ++;

        // mapping the address to Recipient
        recipients[msg.sender] = Recipient({
            id: recipientsNumber,
            addr: msg.sender,
            name: _name,
            bloodType: _bloodType,
            state: State.Registered
        });

        recipientId.push(recipientsNumber);
        recipientAddresses.push(msg.sender);

        // try to match depends on bloodType
        attemptMatchForRecipient(msg.sender,_bloodType);

        // emit event recipient's address
        emit RegisteredRecipient(recipientsNumber,msg.sender);
    }

    // to deregister
    function deregisterDonor(address _donorAddress) public  {
        require(_donorAddress == msg.sender, 'can not deregister from another address');
        require(donors[_donorAddress].state == State.Registered, "Donor: can't be deleted, not registerd or already matched" );
        

        Donor storage donor = donors[_donorAddress];
        donor.state = State.Deleted;
    }

    function deregisterRecipient(address _recipientAddress) public {
        require(_recipientAddress == msg.sender, 'can not deregister from another address');
        require(recipients[_recipientAddress].state == State.Registered, "Recipient: can't be deleted, not registerd or already matched" );
        

        Recipient storage recipient = recipients[_recipientAddress];
        recipient.state  = State.Deleted;
    }


    function attemptMatchForDonor(address _donorAddress, string memory _bloodType) private {
        for(uint256 i = 0; i < recipientAddresses.length; i++){
            address recipientAddr = recipientAddresses[i];
            if(recipientAddr == _donorAddress){
               continue;
            }
            if(recipients[recipientAddr].state == State.Registered && keccak256(bytes(recipients[recipientAddr].bloodType)) == keccak256(bytes(_bloodType))){
                processMatch(_donorAddress, recipientAddr, _bloodType);
                return;
            }
        }    
    }

    function attemptMatchForRecipient(address _recipientAddress, string memory _bloodType) private {
        for(uint256 i = 0; i < donorAddresses.length; i++){
            address donorAddr = donorAddresses[i];
            if(donorAddr == _recipientAddress){
                continue;
            }
            if(donorAddr != _recipientAddress && donors[donorAddr].state == State.Registered && keccak256(bytes(donors[donorAddr].bloodType)) == keccak256(bytes(_bloodType))){
                processMatch(donorAddr,_recipientAddress, _bloodType);
                return;
            }
        }    
    }

    function processMatch(address _donorAddress, address _recipientAddress, string memory _bloodType) private {
        donors[_donorAddress].state = State.Matched;
        recipients[_recipientAddress].state = State.Matched;
        emit Matched(_donorAddress, _recipientAddress, _bloodType);
    }


    
   
}