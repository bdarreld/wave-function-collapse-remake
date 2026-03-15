class Queue {
    constructor(cap) {
       
        // fixed-size array
        this.arr = new Array(cap);  
       
        // index of front element
        this.front = 0; 
       
        // current number of elements
        this.size = 0;    
       
        // maximum capacity
        this.capacity = cap;        
    }

    // Insert an element at the rear
    enqueue(x) {
        if (this.size === this.capacity) {
            console.log("Queue is full!");
            return;
        }
        let rear = (this.front + this.size) % this.capacity;
        this.arr[rear] = x;
        this.size++;
    }

    // Remove an element from the front
    dequeue() {
        if (this.size === 0) {
            console.log("Queue is empty!");
            return -1;
        }
        let res = this.arr[this.front];
        this.front = (this.front + 1) % this.capacity;
        this.size--;
        return res;
    }

    // Check if the queue is empty
    isEmpty(){
        return this.size === 0;
    }

    // Get the front element
    getFront() {
        if (this.size === 0) return -1;
        return this.arr[this.front];
    }

    // Get the rear element
    getRear() {
        if (this.size === 0) return -1;
        let rear = (this.front + this.size - 1) % this.capacity;
        return this.arr[rear];
    }
}