pragma solidity ^0.8.0;

contract Test {
    uint256 a = 0;

    function test(address iasd) external returns (uint256) {
        return 123;
    }
    //@audit - NC01 - not used [L1-L3]
    modifier initializer() {
        _;
    }
    //@audit - L02 - init issue [L1]
    function initialize() initializer external {}
    function init() external { }
    function transfer() external {}

    // TODO : Make these vars
    function mathTest() external {
    //@audit - L01 - blablabla [L1-L5]
        123 + 123;
        123+123;
        123+ 123;
        123 +123;

        123 - 123;
        123-123;
        123- 123;
        123 -123;
    //@audit - L01 - blablabla [L1-L2]
        123 * 123;
        123*123;
        123* 123;
        123 *123;

        123 / 123;
        123/123;
        123/ 123;
        123 /123;
    }
}