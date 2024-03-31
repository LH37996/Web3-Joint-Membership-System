// Contract Logic:
// 1. An account creates a new list.
// 2. An account creates a new task on their list.
// 3. Whenever someone creates a new task, emit a event.task_created
// 4. Let an account mark their task as completed.

module message_addr::newmessage {
    use std::signer;
    use aptos_framework::event;
    use std::string::String;
    use aptos_std::table::{Self, Table};
    use aptos_framework::account;
    #[test_only]  // Alias only used in test must be positioned under #[test_only]
    use std::string;

    // Errors
    const E_NOT_INITIALIZED: u64 = 1;
    const ETASK_DOESNT_EXIST: u64 = 2;
    const ETASK_IS_COMPLETED: u64 = 3;

    // struct GroupList has key { //the message group's name
    //     lists: Table<u64, MessageList>,  // tasks array
    //     pub_list_event: event::EventHandle<MessageList>,  // new task event
    //     lists_counter: u64  // a task counter that counts the number of created tasks (we can use that to differentiate between the tasks)
    // }

    // Key ability allows struct to be used as a storage identifier.
    struct MessageList has key {
        group_name: String, //the message group's name
        following: Table<u64, String>,
        messages: Table<u64, Message>,  // tasks array
        pub_message_event: event::EventHandle<Message>,  // new task event
        messages_counter: u64,  // a task counter that counts the number of created tasks (we can use that to differentiate between the tasks)
        following_counter: u64,
    }

    // A struct that has the , and abilities.storedropcopy
    // - Task needs as it's stored inside another struct (TodoList)StoreStore
    // - value can be copied (or cloned by value).Copy
    // - value can be dropped by the end of scope.Drop
    struct Message has store, drop, copy {
        message_id: u64,  // the message ID - derived from the MessageList message counter.
        address: address,  // address - the account address who created that message.
        title: String,
        text: String,  // content - the task content.
        picture: String, //picture attached with text in URL
        message_funs: String,  // the message can attached some function
        pub_time: u64
    }

        // Creating a list is essentially submitting a transaction, and so we need to know the who signed and submitted the transaction:signer
    // public entry fun create_grouplist(account: &signer){
    //     // entry - an entry function is a function that can be called via transactions. Simply put, whenever you want to submit a transaction to the chain, you should call an entry function.
    //     // signer - The signer argument is injected by the Move VM as the address who signed that transaction.
    //     let lists_holder = GroupList {
    //         lists: table::new(),
    //         pub_list_event: account::new_event_handle<MessageList>(account),
    //         lists_counter: 0
    //     };
    //     // move the TodoList resource under the signer account
    //     move_to(account, lists_holder);

    // }
    
    // Creating a list is essentially submitting a transaction, and so we need to know the who signed and submitted the transaction:signer
    public entry fun create_list(account: &signer, name: String, addr: String){
        // entry - an entry function is a function that can be called via transactions. Simply put, whenever you want to submit a transaction to the chain, you should call an entry function.
        // signer - The signer argument is injected by the Move VM as the address who signed that transaction.
        let lists_holder = MessageList {
            group_name: name,
            following: table::new(),
            messages: table::new(),
            pub_message_event: account::new_event_handle<Message>(account),
            messages_counter: 0,
            following_counter: 1,
        };
        table::upsert(&mut lists_holder.following, 1, addr);
        // move the TodoList resource under the signer account
        move_to(account, lists_holder);
    }

    public entry fun add_following(account: &signer, follow: String) acquires MessageList{
        // gets the signer address, so we can get this account's resource.
        let signer_address = signer::address_of(account);
        // assert signer has created a list
        assert!(exists<MessageList>(signer_address), E_NOT_INITIALIZED);
        // gets the TodoList resource
        let message_list = borrow_global_mut<MessageList>(signer_address);
        // increment task counter
        let counter = message_list.following_counter + 1;
        table::upsert(&mut message_list.following, counter, follow);
        // sets the task counter to be the incremented counter
        message_list.following_counter = counter;
    }

    public entry fun create_Message(account: &signer, title: String, content: String, pic_url: String, funs: String, time: u64) acquires MessageList {
        // gets the signer address, so we can get this account's resource.
        let signer_address = signer::address_of(account);
        // assert signer has created a list
        assert!(exists<MessageList>(signer_address), E_NOT_INITIALIZED);
        // gets the TodoList resource
        let message_list = borrow_global_mut<MessageList>(signer_address);
        // increment task counter
        let counter = message_list.messages_counter + 1;
        // creates a new Task
        let new_message = Message {
            message_id: counter,
            address: signer_address,
            title: title,
            text: content,
            picture: pic_url,
            message_funs: funs,
            pub_time: time,
        };
        // adds the new task into the tasks table
        table::upsert(&mut message_list.messages, counter, new_message);
        // sets the task counter to be the incremented counter
        message_list.messages_counter = counter;
        // fires a new task created event
        event::emit_event<Message>(
            &mut borrow_global_mut<MessageList>(signer_address).pub_message_event,
            new_message,
        );
    }

    // // mark a task as completed.
    // public entry fun complete_task(account: &signer, task_id: u64) acquires TodoList {
    //     // gets the signer address
    //     let signer_address = signer::address_of(account);
    //     // assert signer has created a list
    //     assert!(exists<TodoList>(signer_address), E_NOT_INITIALIZED);
    //     // gets the TodoList resource
    //     let todo_list = borrow_global_mut<TodoList>(signer_address);
    //     // assert task exists
    //     assert!(table::contains(&todo_list.tasks, task_id), ETASK_DOESNT_EXIST);
    //     // gets the task matched the task_id
    //     let task_record = table::borrow_mut(&mut todo_list.tasks, task_id);
    //     // assert task is not completed
    //     assert!(task_record.completed == false, ETASK_IS_COMPLETED);
    //     // update task as completed
    //     task_record.completed = true;
    // }

    #[test(admin = @0x123)]  // Since our tests run outside an account scope, we need to create accounts to use in our tests. The annotation gives us the option to declare those accounts.
    // create a task
    // update task as completed
    public entry fun test_flow(admin: signer) acquires MessageList {
        // creates an admin @todolist_addr account for test
        account::create_account_for_test(signer::address_of(&admin));
        // initialize contract with admin account
        create_grouplist(&admin);
        create_list(&admin, string::utf8(b"ad group"));

        // creates a task by the admin account
        create_Message(&admin, string::utf8(b"hello,world"), string::utf8(b"hello,world"), string::utf8(b"https://www.imgtp.com/"), string::utf8(b"get Coupon"), 100);
        let message_count = event::counter(&borrow_global<MessageList>(signer::address_of(&admin)).pub_message_event);
        assert!(message_count == 1, 4);
        let message_list = borrow_global<MessageList>(signer::address_of(&admin));
        assert!(message_list.messages_counter == 1, 5);
        let message_record = table::borrow(&message_list.messages, message_list.messages_counter);
        assert!(message_record.message_id == 1, 6);
        assert!(message_record.picture == string::utf8(b"https://www.imgtp.com/"), 7);
        assert!(message_record.text == string::utf8(b"hello,world"), 8);
        assert!(message_record.address == signer::address_of(&admin), 9);

        // updates task as completed
        // complete_task(&admin, 1);
        // let todo_list = borrow_global<TodoList>(signer::address_of(&admin));
        // let task_record = table::borrow(&todo_list.tasks, 1);
        // assert!(task_record.task_id == 1, 10);
        // assert!(task_record.completed == true, 11);
        // assert!(task_record.content == string::utf8(b"New Task"), 12);
        // assert!(task_record.address == signer::address_of(&admin), 13);
    }

    // #[test(admin = @0x123)]
    // // This test confirms that an account can't use that function if they haven't created a list before.
    // #[expected_failure(abort_code = E_NOT_INITIALIZED)]
    // // The test also uses a special annotation #[expected_failure] that, as the name suggests, expects to fail with an E_NOT_INITIALIZED error code.
    // public entry fun account_can_not_update_task(admin: signer) acquires TodoList {
    //     // creates an admin @todolist_addr account for test
    //     account::create_account_for_test(signer::address_of(&admin));
    //     // account can not toggle task as no list was created
    //     complete_task(&admin, 2);
    // }
}

